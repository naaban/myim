import express from 'express';
import { UserRoles } from '../model/user.model';
import { ResponseHandler } from '../utils/response.handler';
import { StatusCodes } from 'http-status-codes';
import { Filter, ObjectId, UpdateResult } from 'mongodb';
import _ from 'lodash';
import JWT from '../utils/jwt';
import { CustomError } from '../model/error.model';
import Constants from '../utils/constants';
import { CustomRequest } from '../model/request.model';
import bcrypt from 'bcrypt';
import logger from '../utils/logger';
import { Status } from '../model/status.model';
import { DatabaseClient } from '../utils/database';

export module UserController {
    export async function create(request: CustomRequest, response: express.Response) {
        const requestBody = request.body;
        const responseHandler = new ResponseHandler(response)
        try {
            const saltRounds = 10;
            requestBody.password = await bcrypt.hash(requestBody.password!, saltRounds);
            const dbUser: any = await request.collection?.insertOne(requestBody);
            if (dbUser.acknowledged) {
                const user = await request.collection?.findOne({ _id: new ObjectId(dbUser.insertedId) }, {
                    projection: {
                        password: 0
                    }
                })
                responseHandler.handleSuccess(user);
            }
            else {
                const error = new CustomError({ code: 'Failed', statusCode: StatusCodes.BAD_REQUEST });
                responseHandler.handleFailure(error);
                
            }
        }
        catch (err) {
            responseHandler.handleFailure(err)
        }
    }

    export async function login(request: CustomRequest, response: express.Response) {
        const requestBody = request.body;
        const responseHandler = new ResponseHandler(response)
        try {

            const user = await request.collection?.findOne({ username: requestBody.username! }, request.selectedFields)
            if (!user) {
                throw new CustomError({ code: 'UserNotFound', statusCode: StatusCodes.NOT_FOUND });
            }
            const isPasswordValid = await bcrypt.compare(requestBody.password!, user.password!);
            if (!isPasswordValid) {
                throw new CustomError({ code: 'InvalidCredentials', statusCode: StatusCodes.UNAUTHORIZED });
            }

            const token = getTokenForUser(user)
            const rToken = getRefreshTokenForUser(user);


            delete user.password;
            responseHandler.handleSuccess({ token, rToken, ...user })

        }
        catch (err) {
            responseHandler.handleFailure(err)
        }
    }


    export async function tanentLoginHandler(request: CustomRequest) {
        const { mobileNumber, otp } = request.body;
        const search: Filter<any> = {
            mobileNumber: mobileNumber,

        }
        const otpResponse: any = {
            otp: 0,
            mobileNumber: mobileNumber,
            role: ''
        }
        let user = await request.collection?.findOne(search);
        if (!user) {
            await request.collection?.insertOne({ mobileNumber: mobileNumber, role: UserRoles.LEAD });
            otpResponse.role = UserRoles.LEAD
        }
        else {
            otpResponse.role = user.role
        }

        const min = 100000; // Minimum 6-digit number
        const max = 999999; // Maximum 6-digit number
        otpResponse.otp = Math.floor(Math.random() * (max - min + 1)) + min;
        otpResponse.token = JWT.generate(otpResponse, Constants.ACCESS_TOKEN_EXPIRE_IN_MS)

        return otpResponse
    }
    export async function verifyOtpHandler(request: CustomRequest) {
        const { mobileNumber, otp } = request.body;
        const search: Filter<any> = {
            mobileNumber: mobileNumber,
        }
        const user: any[] = await request.collection?.find(search).toArray() as any;
        if (!_.isEmpty(user)) {
            await request.collection?.updateOne(search, { $set: { mobileVerified: true } });
            const token = getTokenForUser(user[0])
            const rToken = getRefreshTokenForUser(user[0]);

            return { token, rToken, mobileNumber, message: 'Verified!' }
        }
        else {
            throw new CustomError({ code: 'InvalidMobileNumber' })
        }

    }
    export async function tanentLogin(request: CustomRequest, response: express.Response) {
        const responseHandler = new ResponseHandler(response)
        try {
            let data = null;
            switch (request.params.action) {
                case 'login':
                    data = await UserController.tanentLoginHandler(request);
                    break;
                case 'verify':
                    data = await UserController.verifyOtpHandler(request);
                    break;
            }
            responseHandler.handleSuccess(data);
        }
        catch (err) {
            responseHandler.handleFailure(err)
        }
    }

    export function getTokenForUser(user: any) {
        return JWT.generate({
            id: user._id,
            role: user.role,
            aId: user.aId,
            saId: user.saId,
        }, Constants.ACCESS_TOKEN_EXPIRE_IN_MS)
    }


    export function getRefreshTokenForUser(user: any) {
        return JWT.generate({
            id: user._id
        })
    }

    export async function refreshToken(request: CustomRequest, response: express.Response) {
        const responseHandler = new ResponseHandler(response)
        try {
            const user = await request.collection?.findOne({ _id: new ObjectId(request.user!.id!) });
            const token = getTokenForUser(user)
            const rToken = getRefreshTokenForUser(user);
            responseHandler.handleSuccess({ token, rToken });
        }
        catch (err) {
            responseHandler.handleFailure(err)
        }
    }


    export async function getProfile(request: CustomRequest, response: express.Response, next: any) {
        const responseHandler = new ResponseHandler(response)
        const userId = request.user?.id;
        try {
            const user = await request.collection?.findOne({ _id: new ObjectId(userId!) }, {
                projection: {
                    password: 0, _id: 0
                }
            });
            if (user) {
                delete user.password;
                responseHandler.handleSuccess(user);
            }
            else {
                responseHandler.handleFailure(new CustomError({ code: 'NotFound', statusCode: StatusCodes.NOT_FOUND }))
            }

        }
        catch (err) {
            responseHandler.handleFailure(err)
        }

    }
    export async function updateTanentProfile(request: CustomRequest, response: express.Response, next: any) {
        const responseHandler = new ResponseHandler(response)
        try {

            if (request.body.password) {
                const saltRounds = 10;
                request.body.password = await bcrypt.hash(request.body.password!, saltRounds);
            }

            if (request.body.pgId) {
                request.body.status = Status.NOT_ALLOCATED;
                request.body.role = UserRoles.TANENT;
            }

            const pg = await (await DatabaseClient.getModel({ collectionName: Constants.COLLECTIONS.PG })).findOne({ _id: new ObjectId(request.body.pgId) });

            if (pg) {
                request.body.aId = pg.aId;
                request.body.saId = pg.saId;
                const { acknowledged, upsertedId }: UpdateResult = await request.collection?.updateOne({ _id: new ObjectId(request.user?.id) }, { $set: request.body }) as UpdateResult;
                if (acknowledged) {
                    const data = await request.collection?.findOne({ _id: new ObjectId(request.user!.id!) }, {
                        projection: {
                            password: 0,
                            ...request.selectedFields
                        }
                    });
                    responseHandler.handleSuccess({ message: 'Update success!!', data });
                }
                else {
                    responseHandler.handleFailure(new CustomError({ code: "InternalError" }))
                }
            }
            else {
                responseHandler.handleFailure(new CustomError({ code: "NotFound" }))
            }


        }
        catch (err) {
            logger.error(err)
            responseHandler.handleFailure(err)
        }
    }

}

