import express, { query } from 'express';
import { ErrorHandler } from './error.handler';
import { StatusCodes } from 'http-status-codes'
import logger from './logger';
import { CustomError, ICustomError } from '../model/error.model';
import Constants from './constants';
import { CustomRequest } from '../model/request.model';
import _, { result } from 'lodash';
import { Collection, Filter, ObjectId } from 'mongodb';
import { UserRoles } from '../model/user.model';
import { ResponseHandler } from './response.handler';
import { ICollectionModel } from './collection';
import { DatabaseClient } from './database';
import { Middlewares } from './middlewares';
const queryMapper = require('./query.mapper.json');
export module RequestHandler {
    export function handle(collection?: ICollectionModel) {
        return async function (request: CustomRequest, response: express.Response, next: express.NextFunction) {
            logger.info("RequestHandler::handle - Handling the request");
            const responseHandler = new ResponseHandler(response)
            try {
                request = await parseParams(request, collection);
                next();
            }
            catch (err) {
                responseHandler.handleFailure(err);
            }
        }
    }

    export async function parseParams(request: CustomRequest, collection?: ICollectionModel): Promise<CustomRequest> {
        const fields = _.get(request.query, 'fields');
        const search = _.get(request.query, 'search');

        const { role, id, saId, aId } = request.user || {};

        request.findQuery! = {};
        request.selectedFields = {
            _id: 0,
            id: '$_id',
        };
        request.aggrPipeline = [];
        request.isAggregator = false;
        request.limit = _.get(request.query, 'limit', 100) as any;
        request.offset = _.get(request.query, 'offset', 0) as any;

        if (collection) {
            request.collection = await DatabaseClient.getModel(collection);
        }

        if (role === UserRoles.SUPERADMIN) {
            _.set(request.findQuery!, "saId", new ObjectId(id))
            _.set(request.body!, "saId", new ObjectId(id))
        }
        else if(role === UserRoles.DEFAULT_SUPERADMIN) {
            _.set(request.body!, "saId", new ObjectId(id))
        } else if (role === UserRoles.ADMIN) {
            _.set(request.findQuery!, "saId", new ObjectId(saId))
            _.set(request.findQuery!, "aId", new ObjectId(id))
            _.set(request.body!, "saId", new ObjectId(saId))
            _.set(request.body!, "aId", new ObjectId(id))
        } else if (role === UserRoles.TANENT) {
            _.set(request.findQuery!, "saId", new ObjectId(saId))
            _.set(request.findQuery!, "aId", new ObjectId(aId))
            if (request.collection && Constants.COLLECTION_USER_ID_REQUIRED_MAPPING["tanent"].includes(request.collection.collectionName)) {
                _.set(request.findQuery!, "userId", new ObjectId(id))
            }
            _.set(request.body!, "userId", new ObjectId(id))
        }

        if (request.params.id) {
            request.params.id = new ObjectId(request.params.id) as any
        }

        if (request.body) {
            Object.keys(request.body).forEach((item: any) => {
                if (Middlewares.isValidMongoId(request.body[item])) {
                    request.body[item] = new ObjectId(request.body[item]);
                }
            })
        }

        if (request.method === 'GET' || request.method === 'PUT') {
            if (request.method === 'GET') {
                if (!fields) {
                    throw new CustomError({ code: 'ValidationError', message: 'Get Request fields must be required!' });
                }

                if (request.collection) {
                    const collectionQueryMapper = queryMapper[request.collection.collectionName]
                    const collectionFindQuery = _.get(collectionQueryMapper, "findQuery", {});
                    const collectionSelectedFields = _.get(collectionQueryMapper, "selectedFields", {});
                    request.findQuery = _.assign(request.findQuery, collectionFindQuery)
                    request.selectedFields = _.assign(request.selectedFields, collectionSelectedFields)
                    const aggrPipeline = _.get(collectionQueryMapper, "aggregatePipeline", []);

                    if (!_.isEmpty(aggrPipeline)) {
                        request.isAggregator = true;
                    }

                }

                const fieldsArray = fields.toString().split(',').sort();


                if (request.collection && request.isAggregator) {
                    const collectionQueryMapper = queryMapper[request.collection.collectionName]
                    const aggrPipeline = _.get(collectionQueryMapper, "aggregatePipeline", []);
                    _.forEach(fieldsArray, async (field) => {
                        let [fieldKey, fieldValue] = field.split(':');
                        const match = {}
                        const [parentKey, childKey] = fieldKey.split('.');
                        if (parentKey && childKey) {
                            aggrPipeline.forEach((item: any) => {
                                const [key, value] = item.split('.');
 
                                if (fieldKey.toString().includes(key) && !request.aggrPipeline!.includes(queryMapper[item]) && queryMapper[item]) {
                                    request.aggrPipeline!.push(queryMapper[item])
                                }
                                if (fieldValue) {
                                    _.assign(match, { [fieldKey]: fieldValue })
                                }
                            });
                        }

                        _.assign(request.selectedFields, { [fieldKey]: 1 })

                        if (!_.isEmpty(match)) {
                            request.aggrPipeline?.push({
                                $match: match
                            })
                        }

                    })

                    request.aggrPipeline.unshift({
                        $match: request.findQuery
                    })

                    request.aggrPipeline.push({
                        $limit: request.limit
                    })

                    request.aggrPipeline.push({
                        $skip: request.offset
                    })

                    request.aggrPipeline.push({
                        $project: request.selectedFields
                    })
                }
                else {

                    _.forEach(fieldsArray, async field => {
                        const [key, value] = field.split(':');
                        if (key && value) {
                            _.assign(request.findQuery, { [key]: value })
                        }

                        if (Middlewares.isValidMongoId(value as any)) {
                            _.set(request.findQuery!, key, new ObjectId(value));
                        }

                        _.set(request.selectedFields, key, 1);

                    });

                    if (search) {
                        handleQuery(request, search);
                    }
                }
            }

            if (request.method === 'GET' && (hasPasswordField(request.selectedFields) || hasPasswordField(request.findQuery!))) {
                throw new CustomError({ code: 'InvalidRequest' });
            } else if (request.method === 'PUT') {
                request.body.updatedAt = new Date();
                if (request.params.id) {
                    request.findQuery!._id = new ObjectId(request.params.id);
                }
                handleUpdateOperation(request);


            }
        } else if (request.method === 'POST') {
            request.body.createdAt = new Date();

            Object.keys(request.body).forEach((item: any) => {
                _.set(request.selectedFields, item, 1);
            })

        }

        if (request.findQuery?.role === UserRoles.LEAD) {
            delete request.findQuery!.saId;
            delete request.findQuery!.aId;
        }


        return request;
    }

    function hasPasswordField(obj: any) {
        return _.has(obj, 'password');
    }

    function handleQuery(request: CustomRequest, search: any) {
        for (const [key, value] of Object.entries(search)) {
            switch (key) {
                case 'OR':
                case 'AND':
                    if (!request.findQuery![`$${key.toLowerCase()}`]) {
                        request.findQuery![`$${key.toLowerCase()}`] = [];
                    }
                    request.findQuery![`$${key.toLowerCase()}`].push(...value as any);
                    break;
                default:
                    if (value === 'NIN' || value === 'IN') {
                        if (!request.findQuery![key][`$${value.toLowerCase()}`]) {
                            request.findQuery![key][`$${value.toLowerCase()}`] = [];
                        }
                        request.findQuery![key][`$${value.toLowerCase()}`].push(...search[key]);
                    } else {
                        request.findQuery![key] = value;
                    }
                    break;
            }
        }
    }

    function handleUpdateOperation(request: CustomRequest) {
        let operation: any = {};
        for (const [key, value] of Object.entries(request.body)) {
            if (typeof value === 'object' && value !== null && !(value instanceof Date) && !(value instanceof ObjectId)) {
                for (const [opr, oprValue] of Object.entries(value)) {
                    if (typeof oprValue === 'object' && oprValue !== null) {
                        switch (opr) {
                            case "PUSH":
                            case "PULL":
                                if (!operation[`$${opr.toLowerCase()}`]) {
                                    operation[`$${opr.toLowerCase()}`] = {};
                                }
                                operation[`$${opr}`][key] = oprValue;
                                break;
                            case "QUERY": {
                                const query = Object.keys(oprValue).reduce((prev: any, curr: any) => {
                                    prev[`${key}.${curr}`] = oprValue[curr];
                                    return prev
                                }, {})
                                handleQuery(request, query);
                                break;

                            }
                            case "SET": {
                                if (!operation.$set) {
                                    operation.$set = {}
                                }
                                _.assign(operation.$set, Object.keys(oprValue).reduce((prev: any, curr: any) => {
                                    prev[`${key}.$.${curr}`] = oprValue[curr];
                                    return prev
                                }, {}))
                                break;
                            } default:
                                throw new CustomError({ code: 'UnknownOperation', statusCode: StatusCodes.BAD_REQUEST })
                        }

                    } else {
                        if (!operation.$set) {
                            operation.$set = {}
                        }
                        operation.$set[`${key}.${opr}`] = oprValue;
                    }
                }
            }
            else {
                if (!operation.$set) {
                    operation.$set = {}
                }
                operation.$set[`${key}`] = value;
            }

        }

        request.body = operation;
    }



}
