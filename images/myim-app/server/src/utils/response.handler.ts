import express from 'express';
import { ErrorHandler } from './error.handler';
import { StatusCodes } from 'http-status-codes'
import logger from './logger';
import { ICustomError } from '../model/error.model';
import Constants from './constants';
export class ResponseHandler {
    private response: express.Response;
    private errorHandler: ErrorHandler;
    constructor(  response: express.Response) {
        this.response = response;
        this.errorHandler = new ErrorHandler(response);
    }

    handleSuccess(data: any) {
        if (data) {
            this.response.status(StatusCodes.OK);
            if (data.token) {
                this.response.cookie('token', data.token, { httpOnly: true, maxAge: Constants.ACCESS_TOKEN_EXPIRE_IN_MS }); // maxAge is set to 30 seconds
            }
            if (data.rToken) {
                this.response.cookie('rToken', data.rToken, { httpOnly: true });
            }

            this.response.send(data)
        }
        else {
            this.response.status(StatusCodes.NO_CONTENT);
            this.response.send();
        }

        this.response.end();
    }


    injectInResponse(res: express.Response, data: any) {
        const send = res.send;
        res.send = (body: any): any => {
            if (body.data) {
                body.data = {
                    ...body.data,
                    ...data
                }
            }
            else {
                body = {
                    ...body,
                    ...data
                }
            }
            res.send = send;
            res.send(body);
        };
    }

    handleFailure(error: any) {
        error = this.errorHandler.handle(error)
       
        this.response.send(error);
        logger.error(error);
        this.response.end();
    }
}