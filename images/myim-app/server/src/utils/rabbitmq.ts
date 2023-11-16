import amqp from 'amqplib';
import _ from 'lodash';
import { DatabaseClient } from './database';
import logger from './logger';
import { Middlewares } from './middlewares';
import { ClientSession, ObjectId, Transaction } from 'mongodb';
const queryMapper = require('./query.mapper.json');

export module RabbitMQ {
    let connection: amqp.Connection | null = null;

    export async function getRabbitMQConnection() {
        if (!connection) {
            try {
                const username = process.env.RABBIT_MQ_USERNAME as string;
                const password = process.env.RABBIT_MQ_PASSWORD as string;
                const amqpServerURL = `amqp://${username}:${password}@${process.env.RABBIT_MQ_HOST}:${process.env.RABBIT_MQ_PORT}`;
                connection = await amqp.connect(amqpServerURL);
                logger.info('[AMQP] Connected to the server');
            } catch (error) {
                logger.error('Error occurred while connecting to the AMQP server:', error);
            }
        }
        return connection;
    }


    const replacePlaceholder = (template: any, data: any) => {
        _.forEach(_.entries(template), ([key, value]) => {
            if (typeof value === 'object') {
                template[key] = replacePlaceholder(value, data);
                if (!template[key]) {
                    return false;
                }
            }
            else {
                if (value && value.toString().includes("%")) {
                    let parsedData = data[(value! as string).split('%').join('')]
                    if (!parsedData) {
                        return false;
                    }
                    if (Middlewares.isValidMongoId(parsedData)) {
                        parsedData = new ObjectId(parsedData)
                    }
                    template[key] = parsedData
                }
            }
        })
        return template;
    };

    export async function subscribe(queues: string[]) {
        try {
            const conn = await getRabbitMQConnection();
            if (!conn) {
                return;
            }
            const channel = await conn.createChannel();

            _.forEach(queues, (queue: string) => {
                channel.assertQueue(queue, { durable: true });
                channel.consume(queue, async (message: any) => {
                    const messageContent = JSON.parse(message.content.toString());
                    if (message !== null) {
                        // Iterate through each action
                        const actions = _.clone(queryMapper[queue].actions)
                        _.map(_.keys(actions), async (k) => {
                            const [key, value] = _.split(k, "::");
                            if (messageContent[key] === value) {
                                _.map(actions[k], async (subAction) => {
                                    const { collection, findQuery, selectedFields, preexecute, execute } = subAction;
                                    // Execute the collection findQuery as a filter
                                    try {
                                        await Promise.all(
                                            _.map(preexecute, async (action) => {
                                                if (action.type === 'update') {
                                                    const updateCol = (await DatabaseClient.getModel({ collectionName: action.collection }))
                                                    const updateQuery: any = action.query
                                                    const updateFindQuery: any = action.set
                                                    await updateCol.updateOne(updateFindQuery, { $set: updateQuery });
                                                    logger.info(`${action.type}::preexecute: ${JSON.stringify(updateQuery)} in queue ${queue} collection: ${action.collection}`);
                                                }
                                                else {
                                                    logger.info(`${action.type}:NOT FOUND`);
                                                }
                                            })
                                        );

                                        const col = (await DatabaseClient.getModel({ collectionName: collection }))
                                        const queryResult = await col.findOne(replacePlaceholder(findQuery, messageContent), { projection: selectedFields });
                                        // Append the results with message.content from the executed query result
                                        const updatedMessageContent = { ...messageContent, ...queryResult };


                                        // Execute the 'execute' field
                                        await Promise.all(
                                            _.map(execute, async (action) => {
                                                if (action.type === 'update') {
                                                    const updateCol = (await DatabaseClient.getModel({ collectionName: action.collection }))
                                                    const updateQuery: any = replacePlaceholder(action.set, updatedMessageContent);
                                                    const updateFindQuery: any = replacePlaceholder(action.query, updatedMessageContent);
                                                    await updateCol.updateOne(updateFindQuery, { $set: updateQuery });
                                                    logger.info(`${action.type}::execute: ${JSON.stringify(updatedMessageContent)} in queue ${queue} collection: ${action.collection}`);
                                                }
                                                else {
                                                    logger.info(`${action.type}:NOT FOUND`);
                                                }
                                            })
                                        );
                                    }
                                    catch (err) {
                                        logger.error(err);
                                    }
                                    // }
                                })
                            }
                        })
                        channel.ack(message);
                    }
                });
            })

        } catch (error) {
            logger.error('Error occurred while consuming message:', error);
        }
    }

    export async function publish(queue: string = 'updates', message: any) {
        try {
            const conn = await getRabbitMQConnection();
            if (!conn) {
                return;
            }
            const channel = await conn.createChannel();

            const payload = JSON.stringify(message);

            channel.assertQueue(queue, { durable: true });
            channel.sendToQueue(queue, Buffer.from(payload));
            logger.info(`[AMQP] ${queue} action message sent: ${payload}`);
        } catch (error) {
            logger.error('Error occurred while producing message:', error);
        }
    }
}
