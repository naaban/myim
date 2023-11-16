
import { Collection, Filter, InsertManyResult, MongoClient, MongoError } from 'mongodb';
import { ICollectionModel } from './collection';
import logger from './logger';

import { UserRoles } from '../model/user.model';

import Constants from './constants';

import bcrypt from 'bcrypt';

const seeds = require('./seeds.json');

const errors = require("./errors.json");

const defaultDatabaseName: string = "pgmgnt";


if (!process.env.MONGO_URL) {
    process.exit(1)
}

const connection = new MongoClient(process.env.MONGO_URL, {
    authSource: 'admin',
    auth: {
        username: process.env.MONGO_USERNAME,
        password: process.env.MONGO_PASSWORD
    }
});

export module DatabaseClient {


    let client: any = null
    export async function init() {
        try {
            client = await connection.connect();

            // Provide the path to your JSON index definitions
            const indexesPath = './indexes.json';
            DatabaseClient.createIndexes(indexesPath);
            DatabaseClient.createMetaData()
            return client
        }
        catch (err) {
            console.log(err)
            throw err;
        }
    }

    export async function getClient() {
        if (client) {
            return client;
        }
        return await init();
    }

    export async function createMetaData() {

        // Create a filter to check if the document exists
        const filter: Filter<any> = { role: UserRoles.DEFAULT_SUPERADMIN };

        // Set the data to be inserted if the document does not exist
        const saltRounds = 10;

        const password = await bcrypt.hash('superadmin', saltRounds);

        const updateDoc = {
            $setOnInsert: { username: 'superadmin', password },
        };
        // Set the options for the update operation
        const options = { upsert: true };

        // Perform the update operation
        const collection = await getModel({ dbName: defaultDatabaseName, collectionName: Constants.COLLECTIONS.USER });

        const result = await collection?.updateOne(filter, updateDoc, options);

        if (result && result?.upsertedCount > 0) {
            logger.info('Default super admin created');
        } else {
            logger.info('Default super admin already exists');
        }
        // TODO

        await seedMetaData();
    }
    export async function seedMetaData() {
        // TODO
        for (const seed of seeds) {

            try {
                // Perform the update operation
                const collection = await getModel({ dbName: seed.database, collectionName: seed.collection });

                const { insertedCount, insertedIds }: InsertManyResult = await collection?.insertMany(seed.datas) as InsertManyResult;

                if (insertedCount) {
                    logger.info(`Default ${seed.collection} data created :: Total Count ${insertedCount} :: ${JSON.stringify(insertedIds)}`);
                } else {
                    logger.info(`${seed.collection} data already exists`);
                }
            }
            catch (err) {
                if (err instanceof MongoError) {
                    logger.error(`${seed.collection} Data ${errors[err.code!.toString()]}`);
                }
            }

        }

    }

    export async function useDatabase(dbName: string) {
        return connection.db(dbName);
    }

    export async function getModel(model: ICollectionModel): Promise<Collection> {
        const database = await useDatabase(model.dbName || defaultDatabaseName);
        if (!model.collectionName) {
            throw new Error('cid and name is required')
        }
        return database.collection(model.collectionName)
    }


    export async function createIndexes(indexesPath: string) {
        // Read the index definitions from the JSON file
        const indexes = require(indexesPath);

        // Iterate through the index definitions and create the indexes
        for (const index of indexes) {
            const { collection, fields, options } = index;
            try {
                const model = await getModel({ collectionName: index.collection });
                const indexKey: any = {};

                // Create the index key object with the specified fields and their sorting order
                for (const field of fields) {
                    if (typeof field === 'string') {
                        // Default to ascending order (1) if no "order" property is specified
                        indexKey[field] = 1;
                    } else if (field.name) {
                        // Use the specified sorting order for the field
                        indexKey[field.name] = field.order || 1; // Default to ascending order (1)
                    }
                }

                await model.createIndex(indexKey, options);
                logger.info(`Index created for collection '${collection}' on fields '${fields.map((field: any) => (typeof field === 'string' ? field : field.name)).join(', ')}'`);
            } catch (error: any) {
                logger.info(`Failed to create index for collection '${collection}' on fields '${fields.map((field: any) => (typeof field === 'string' ? field : field.name)).join(', ')}': ${error.message}`);
                process.exit(1)
            }
        }
    }


}