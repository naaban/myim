

import express from 'express';
import { Meta, body, checkSchema, param, query, validationResult } from 'express-validator';
import { ResponseHandler } from './response.handler';
import { IToken } from '../model/token.model';
import { CustomError } from '../model/error.model';
import { StatusCodes } from 'http-status-codes';
import JWT from './jwt';
import { CustomRequest } from '../model/request.model';
import logger from './logger';
import { ObjectId } from 'mongodb';
import { UserRoles, } from '../model/user.model';
import { Status } from '../model/status.model';
import { ValidationChain, Validators } from 'express-validator/src/chain';
import Constants from './constants';
import { ICollectionModel } from './collection';
import { DatabaseClient } from './database';
import multer from 'multer';
const seeds = require('./seeds.json')
// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req: CustomRequest, file: any, cb: Function) {
        // Specify the destination folder for the uploaded files
        cb(null, Constants.UPLOADS_DIR);
    },
    filename: function (req: CustomRequest, file: any, cb: Function) {
        // Customize the filename if needed
        req.body.file = `${Constants.UPLOADS_DIR}${file.originalname}`
        cb(null, file.originalname);
    }
});

export module Middlewares {
    export function isValidMongoId(value: ObjectId) {
        return (ObjectId.isValid(value) && typeof value === 'string') || value instanceof ObjectId;
    };
    export function removeIdsFromRequest(req: CustomRequest, res: express.Response, next: express.NextFunction) {
        const properties = ['aId', 'saId', 'userId'];
        for (const prop of properties) {
            delete req.findQuery?.[prop];
            delete req.selectedFields?.[prop];
            delete req.body?.[prop];
            delete req.query?.[prop];
            delete req.params?.[prop];
        }
        next();
    }
    export function validateFields(allowedFields: string[]) {
        return (req: express.Request, res: express.Response, next: express.NextFunction) => {
            const receivedFields = Object.keys(req.body);
            const invalidFields = receivedFields.filter(field => !allowedFields.includes(field));
            if (invalidFields.length > 0) {
                const responseHandler = new ResponseHandler(res);
                responseHandler.handleFailure(new CustomError({ code: 'InvalidFields', message: `Invalid fields: ${invalidFields.join(', ')}` }));
                return;
            }
            next();
        };
    };
    export const RequestValidatorRules = {
        'user.create': [
            body('username').isString().isLength({ min: 3, max: 255 }).withMessage('Username must be a string between 3 and 255 characters'),
            body('password').isString().isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
            body('status').optional().isIn([Status.ACTIVE, Status.INACTIVE, Status.SUSPENDED]),
            body('role').optional().isIn([UserRoles.SUPERADMIN, UserRoles.ADMIN, UserRoles.TANENT]).custom((value, { req }) => {
                return Middlewares.roleMapper[req.user!.role!].includes(value);
            }),
            body('mobileNumber').isMobilePhone('any', { strictMode: false }).withMessage('Invalid mobile number'),
            body('lastLogin').optional().isISO8601().toDate(),
            body('createdAt').optional().isISO8601().toDate(),
            body('updatedAt').optional().isISO8601().toDate(),
            body('aId').optional().custom(Middlewares.isValidMongoId).withMessage('Invalid aId'),
            body('saId').optional().custom(Middlewares.isValidMongoId).withMessage('Invalid saId'),
            body('reasonForLeaving').optional().isString().isLength({ max: 255 }).withMessage('Reason for leaving must be a string up to 255 characters'),
        ],
        'user.tanent.login': [
            body('mobileNumber').isMobilePhone('any', { strictMode: false }).withMessage('Invalid mobile number'),
        ],
        'user.tanent.verify': [
            body('mobileNumber').isMobilePhone('any', { strictMode: false }).withMessage('Invalid mobile number'),
            body('otp').isNumeric().isLength({ min: 6, max: 6 }).withMessage('OTP must be a 6-digit number'),
        ],
        'user.update': [
            body('email').optional().isEmail().withMessage('Invalid email address'),
            body('reasonForLeaving').optional().isString().isLength({ max: 255 }).withMessage('Reason for leaving must be a string up to 255 characters'),
            body('status').optional().isIn([Status.ACTIVE, Status.INACTIVE, Status.SUSPENDED]).withMessage('Invalid status'),
            body('password').optional().isString().isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
            body('pgId').optional().custom(Middlewares.isValidMongoId).withMessage('Invalid pgId'),
        ],
        'pg.create': [
            body('name').isString().isLength({ min: 3, max: 255 }).withMessage('Username must be a string between 3 and 255 characters'),
            body('address').isString().isLength({ min: 3, max: 255 }).withMessage('Address must be a string between 3 and 255 characters'),
            body('email').isEmail(),
            body('status').optional().isIn([Status.ACTIVE, Status.INACTIVE, Status.SUSPENDED]),
            body('mobileNumber').isMobilePhone('any', { strictMode: false }).withMessage('Invalid mobile number'),
        ],
        'pg.update': [
            body('name').optional().isString().isLength({ min: 3, max: 255 }).withMessage('Username must be a string between 3 and 255 characters'),
            body('address').optional().isString().isLength({ min: 3, max: 255 }).withMessage('Address must be a string between 3 and 255 characters'),
            body('email').optional().isEmail(),
            body('status').optional().isIn([Status.ACTIVE, Status.INACTIVE, Status.SUSPENDED]),
            body('mobileNumber').optional().isMobilePhone('any', { strictMode: false }).withMessage('Invalid mobile number'),
        ],
        'pg.room.create': [
            body('roomNumber').isInt().withMessage('Room number must be a number'),
            body('facilities').isArray().withMessage('Facilities must be an array').isIn(seeds.find((item: any) => item.collection === Constants.COLLECTIONS.PG_ROOM_FACILITIES).datas.map((item: any) => item.name)
            ).withMessage('Facility passed is not found'),
            body('type').isString().withMessage('Type must be a non-empty string').isIn(seeds.find((item: any) => item.collection === Constants.COLLECTIONS.PG_ROOM_TYPES).datas.map((item: any) => item.name)
            ).withMessage('Type passed is not found'),
            body('pgId').custom(Middlewares.isValidMongoId).withMessage('Invalid pgId'),
            body('status').optional().isIn([Status.ACTIVE, Status.INACTIVE, Status.SUSPENDED]),
        ],
        'pg.room.update': [
            body('roomNumber').optional().isInt().withMessage('Room number must be a number'),
            body('facilities').optional().isArray().withMessage('Facilities must be an array').isIn(seeds.find((item: any) => item.collection === Constants.COLLECTIONS.PG_ROOM_FACILITIES).datas.map((item: any) => item.name)
            ).withMessage('Facility passed is not found'),
            body('type').optional().isString().withMessage('Type must be a non-empty string').isIn(seeds.find((item: any) => item.collection === Constants.COLLECTIONS.PG_ROOM_TYPES).datas.map((item: any) => item.name)
            ).withMessage('Type passed is not found'),
            body('pgId').optional().custom(Middlewares.isValidMongoId).withMessage('Invalid pgId'),
            body('status').optional().isIn([Status.ACTIVE, Status.INACTIVE, Status.SUSPENDED]),
        ],
        'pg.room.facility.create': [
            body('name').isString().isLength({ min: 1 }).withMessage('Name must be a non-empty string'),
        ],
        'pg.room.facility.update': [
            param('id').custom(Middlewares.isValidMongoId),
            body('name').isString().isLength({ min: 1 }).withMessage('Name must be a non-empty string'),
        ],
        'pg.room.facility.delete': [
            param('id').custom(Middlewares.isValidMongoId),
        ],

    }
    // Dynamic validation middleware function
    export function requestValidator(validations: ValidationChain[]) {
        return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            const responseHandler = new ResponseHandler(res);

            // Get fields from the validation chain
            const fields: string[] = validations.map((validation) => {
                const field = validation.builder.build().fields[0];
                return field ? field : '';
            });
            // Get fields from the request body
            const receivedFields = Object.keys(req.body);

            // Check for any invalid fields
            const invalidFields = receivedFields.filter(field => {
                if (field.includes('.')) {
                    return !fields.includes(`${field.split('.')[0]}.*`);
                } else {
                    return !fields.includes(field);
                }
            });
            if (invalidFields.length > 0) {
                responseHandler.handleFailure(new CustomError({ code: 'InvalidFields', message: `Invalid fields: ${invalidFields.join(', ')}` }));
                return;
            }
            await Promise.all(validations.map((validation: any) => validation.run(req)));

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                responseHandler.handleFailure(new CustomError({ data: errors.array(), statusCode: StatusCodes.BAD_REQUEST, code: 'ValidationError' }));
                return;
            }


            return next();
        };
    };



    export function getTokensFromRequest(req: express.Request): IToken {
        logger.info("getTokensFromRequest::executing");
        const accessToken = req.headers['x-access-token'] || req.query.token || req.body.token || req.params.token || req.cookies.token || null;
        const refreshToken = req.headers['x-refresh-token'] || req.query.rToken || req.body.rToken || req.params.rToken || req.cookies.rToken || null;
        return { accessToken, refreshToken };
    }
    export function verifyToken(req: CustomRequest, res: express.Response, next: express.NextFunction) {
        logger.info("verifyToken::Token validation process");
        const { refreshToken, accessToken }: IToken = Middlewares.getTokensFromRequest(req);
        const responseHandler = new ResponseHandler(res)
        if (accessToken) {
            try {
                const user: any = JWT.verifyAndDecode(accessToken);
                req.user = user;
                return next();
            }
            catch (err) {
                responseHandler.handleFailure(err);
            }

        }
        else {
            responseHandler.handleFailure(new CustomError({ code: 'TokenNotFound', statusCode: StatusCodes.UNAUTHORIZED }));
        }
    }
    export function verifyRefreshToken(req: CustomRequest, res: express.Response, next: express.NextFunction) {
        logger.info("verifyRefreshToken::Token validation process");
        const { refreshToken, accessToken }: IToken = Middlewares.getTokensFromRequest(req);
        const responseHandler = new ResponseHandler(res)
        if (refreshToken) {
            const user: any = JWT.verifyAndDecode(refreshToken);
            if (user) {
                req.user = user;
                next();
            }
            else {
                Middlewares.clearCookies(req, res)
                const error = new CustomError({ code: 'UnAuthorized', statusCode: StatusCodes.UNAUTHORIZED })
                responseHandler.handleFailure(error)
            }
        }
        else {
            Middlewares.clearCookies(req, res)
            const error = new CustomError({ code: 'TokenNotFound', statusCode: StatusCodes.UNAUTHORIZED })
            responseHandler.handleFailure(error)
        }
    }

    export function clearCookies(request: express.Request, response: express.Response) {
        const cookies = request.cookies;
        // Clear all cookies by iterating through the keys and clearing each cookie
        Object.keys(cookies).forEach(cookieName => {
            response.clearCookie(cookieName);
        });
    }
    export function isAuthenticated(request: express.Request, response: express.Response, next: express.NextFunction) {
        const { accessToken, refreshToken }: IToken = Middlewares.getTokensFromRequest(request)
        const responseHandler = new ResponseHandler(response)
        if (accessToken || refreshToken) {
            next();
        }
        else {
            responseHandler.handleFailure(new CustomError({ code: 'UnAuthorized' }));
        }
    }

    export function checkRouteIsAccessible(role: any[]) {
        return async (req: CustomRequest, res: express.Response, next: express.NextFunction) => {
            const responseHandler = new ResponseHandler(res);

            if (role.includes(req.user?.role)) {
                return next();
            }
            else {
                responseHandler.handleFailure(new CustomError({ code: 'NoAccess' }));
            }
        };

    }


    export const roleMapper: any = {
        [UserRoles.ADMIN]: [UserRoles.TANENT],
        [UserRoles.SUPERADMIN]: [UserRoles.ADMIN, UserRoles.TANENT],
        [UserRoles.DEFAULT_SUPERADMIN]: [UserRoles.SUPERADMIN, UserRoles.ADMIN, UserRoles.TANENT]
    };

    export function checkClientCertificate(request: CustomRequest, response: express.Response, next: express.NextFunction) {
        // if(request.client.)
        next();
    }


    export function checkIdExists(col: ICollectionModel, idField: string) {
        return async (request: CustomRequest, response: express.Response, next: any) => {

            const collection = await DatabaseClient.getModel(col);
            const responseHandler = new ResponseHandler(response)
            const query = { _id: new ObjectId(request.body[idField] || request.params[idField] || request.findQuery![idField]) };
            const count = await collection.countDocuments(query);
            if (count > 0) {
                // Data exists
                next()
            } else {
                // Data does not exist
                responseHandler.handleFailure(new CustomError({
                    code: 'ValidationError', data: [{
                        type: "field",
                        msg: "ID not found in database",
                        path: idField,
                        location: "unknown"
                    }]
                }))
            }

        }
    }



    // Define multer upload instance
    export const upload = multer({ storage: storage });




}