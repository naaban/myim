import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { body } from 'express-validator'
import { UserRoles } from "../model/user.model";
import { Cache } from "../utils/cache";
import { BaseController } from "../controllers/base.controller";
import { ICollectionModel } from "../utils/collection";
import Constants from "../utils/constants";
import { RequestHandler } from "../utils/request.handler";
import { Middlewares } from "../utils/middlewares";
import { OtpController } from "../controllers/otp.controller";

const collection: ICollectionModel = { collectionName: Constants.COLLECTIONS.PAYMENTS }
export class OtpRoute {
    private router: Router
    constructor() {
        this.router = Router();
    }
    addRoutes() {
        const commonMiddleWares = [Middlewares.isAuthenticated, Middlewares.verifyToken];
        this.router.post('', commonMiddleWares, Middlewares.checkRouteIsAccessible([UserRoles.TANENT]), RequestHandler.handle(collection), OtpController.generateOtp);
        this.router.put('/:id', commonMiddleWares, Middlewares.checkRouteIsAccessible([UserRoles.ADMIN, UserRoles.SUPERADMIN, UserRoles.DEFAULT_SUPERADMIN]), RequestHandler.handle(collection), OtpController.verifyOtp);
        return this.router;
    }

}