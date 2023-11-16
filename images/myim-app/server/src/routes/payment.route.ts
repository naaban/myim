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

const collection: ICollectionModel = { collectionName: Constants.COLLECTIONS.PAYMENTS }
export class PaymentRoute {
    private router: Router
    constructor() {
        this.router = Router();
    }
    addRoutes() {
        const commonMiddleWares = [Middlewares.isAuthenticated, Middlewares.verifyToken];
        this.router.post('' , Middlewares.upload.single('file'), commonMiddleWares, Middlewares.checkRouteIsAccessible([UserRoles.TANENT]), RequestHandler.handle(collection), BaseController.create);
        this.router.get('', commonMiddleWares, Middlewares.checkRouteIsAccessible([UserRoles.ADMIN, UserRoles.SUPERADMIN, UserRoles.DEFAULT_SUPERADMIN,UserRoles.TANENT]), RequestHandler.handle(collection), BaseController.get);
        return this.router;
    }

}