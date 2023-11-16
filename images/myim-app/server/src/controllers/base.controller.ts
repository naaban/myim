// Importing necessary modules and dependencies
import express from 'express';
import { CustomRequest } from '../model/request.model';
import { ResponseHandler } from '../utils/response.handler';
import { DeleteResult, InsertOneResult, ObjectId, UpdateResult } from 'mongodb';
import { CustomError } from '../model/error.model';
import logger from '../utils/logger';
import Constants from '../utils/constants';
import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import _ from 'lodash';
import { RabbitMQ } from '../utils/rabbitmq';

// Exporting the BaseController module
export module BaseController {


    // Modify the create function to handle optional file upload
    export async function create(request: CustomRequest, response: express.Response, next: any) {
        const responseHandler = new ResponseHandler(response)

        try {
            await processCreate(request, responseHandler);
        }
        catch (err) {
            logger.error(err);
            responseHandler.handleFailure(err);
        }
    }

    // Function to handle the create request
    async function processCreate(request: CustomRequest, responseHandler: ResponseHandler) {
        try {
            const { acknowledged, insertedId }: InsertOneResult = await request.collection?.insertOne(request.body) as InsertOneResult;
            if (acknowledged) {
                const query = { _id: new ObjectId(insertedId) }
                logger.info(`Query: ` , query  , request.selectedFields );
                const data = await request.collection?.findOne(query, request.selectedFields);
                RabbitMQ.publish(request.collection?.collectionName, data);
                responseHandler.handleSuccess(data);
            } else {
                responseHandler.handleFailure(new CustomError({ code: "InternalError" }));
            }
        }
        catch (err) {
            logger.error(err);
            responseHandler.handleFailure(err);
        }
    }
    // Function to get data
    export async function get(request: CustomRequest, response: express.Response, next: any) {

        const responseHandler = new ResponseHandler(response)
        try {
            const options: any = { projection: request.selectedFields };

            if (request.limit) {
                options.limit = parseInt(request.limit as any);
            }

            if (request.limit) {
                options.skip = parseInt(request.offset as any);
            }

            const aggrPipeline = _.get(request, "aggrPipeline");
            const isAggregator = _.get(request, "isAggregator", false);
            logger.info("Executing")
            logger.info(request.findQuery);
            logger.info(request.aggrPipeline);
            logger.info(request.selectedFields);
            const [data, totalCount] = await Promise.all([
                isAggregator ? request.collection?.aggregate(aggrPipeline).toArray() : request.collection?.find(request.findQuery!, options).toArray(),
                request.collection?.countDocuments(request.findQuery!)
            ]);
            const result = {
                result: data,
                total: totalCount,
                limit: options.limit,
                offset: options.offset
            };
            responseHandler.handleSuccess(result);
        }
        catch (err) {
            logger.error(err);
            responseHandler.handleFailure(err);
        }
    }

    // Function to update data by ID
    export async function updateById(request: CustomRequest, response: express.Response, next: any) {
        const responseHandler = new ResponseHandler(response)
        try {
            // Check if the collection name is for users and handle password hashing
            if (request.collection?.collectionName === Constants.COLLECTIONS.USER) {
                if (request.body.password) {
                    const saltRounds = 10;
                    request.body.password = await bcrypt.hash(request.body.password!, saltRounds);
                }
            }

            const { acknowledged, upsertedId, modifiedCount }: UpdateResult = await request.collection?.updateOne(request.findQuery!, request.body) as UpdateResult;
            if (modifiedCount) {
                delete request.selectedFields.id;
                const data = await request.collection?.findOne({ _id: request.params.id! as any }, { projection: request.selectedFields });
                RabbitMQ.publish(request.collection?.collectionName, request.body.$set)
                responseHandler.handleSuccess({ message: 'Update success!!', data });
            }
            else {
                responseHandler.handleFailure(new CustomError({ code: "UpdateFailed" }));
            }
        }
        catch (err) {
            logger.error(err);
            responseHandler.handleFailure(err);
        }
    }

    // Function to delete data by ID
    export async function deleteById(request: CustomRequest, response: express.Response, next: any) {
        const responseHandler = new ResponseHandler(response)
        try {
            const data = await request.collection?.findOne(request.findQuery!);
            if (data) {
                const { acknowledged }: DeleteResult = await request.collection?.deleteOne({ _id: new ObjectId(request.params.id) }) as DeleteResult;
                if (acknowledged)
                    responseHandler.handleSuccess({ message: 'Delete success!!' });
                else {
                    responseHandler.handleFailure(new CustomError({ code: "InternalError" }));
                }
            }
            else {
                responseHandler.handleFailure(new CustomError({ code: "NotFound", statusCode: StatusCodes.NOT_FOUND }));
            }

        }
        catch (err) {
            logger.error(err);
            responseHandler.handleFailure(err);
        }
    }
}
