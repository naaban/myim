import express, { NextFunction } from 'express';
import logger from './logger';
import { StatusCodes } from 'http-status-codes';
import { CustomError, ErrorCodes, ICustomError } from '../model/error.model';
import _ from 'lodash';
import { MongoError } from 'mongodb';

export class ErrorHandler {


    private response?: express.Response

    constructor(response?: express.Response) {
        this.response = response;
    }


    handle(error: any, request?: any, response?: any, next?: NextFunction) {

        if (response) {
            this.response = response;
        }
        console.log(error);

        if (error.statusCode) {
            this.response?.status(error.statusCode);
        }
        else {
            this.response?.status(StatusCodes.BAD_REQUEST)
        }
        if (error instanceof CustomError) {
            error = error.getError();
        }
        else if (error instanceof MongoError) {
            this.response?.status(StatusCodes.BAD_REQUEST);
            error = new CustomError({ code: error.code?.toString() as any}).getError();
        }
        else {
            this.response?.status(StatusCodes.INTERNAL_SERVER_ERROR);
            error = new CustomError(error).getError();
        }
        return error;

    }

    handleInternalError(error: any) {
        logger.error(error);
        process.exit(1);
    }

}
