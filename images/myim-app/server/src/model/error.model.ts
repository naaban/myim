import { StatusCodes } from "http-status-codes";
const errorCodes = require('../utils/errors.json');


export interface ICustomError {
    message?: string | '',
    code: string,
    statusCode?: StatusCodes,
    data?: any[]
}

export class CustomError extends Error implements ICustomError {
    code: string;
    statusCode?: number;
    data?: any[]
    constructor(error: ICustomError) {
        super(error.message ? error.message : '')
        this.code = error.code; // Set the custom error code
        this.statusCode = error.statusCode ; // Set the HTTP status code (e.g., 400 Bad Request)
        this.data = error.data || undefined
        // Capturing the stack trace
        Error.captureStackTrace(this, this.constructor);
    }

    getError(): ICustomError {
        this.message = this.message ? this.message : (errorCodes as ErrorCodes)[this.code || 'UnkownError']
        return {
            message: this.message,
            code: this.code || 'UnknownError',
            data: this.data
        }
    }
}

export interface ErrorCodes {
    [code: string]: string;
}