import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { body } from 'express-validator'
import { Middlewares } from "../utils/middlewares";
import { UserRoles } from "../model/user.model";
import { RequestHandler } from "../utils/request.handler";
import { Cache } from "../utils/cache";
import { BaseController } from "../controllers/base.controller";
import { ICollectionModel } from "../utils/collection";
import Constants from "../utils/constants";

const collection: ICollectionModel = { collectionName: Constants.COLLECTIONS.USER }
export class UserRoute {
    private router: Router
    constructor() {
        this.router = Router()
    }
    addRoutes() {


        this.router.post('/tanent/:action(login)', Middlewares.requestValidator(Middlewares.RequestValidatorRules['user.tanent.login']), RequestHandler.handle(collection), UserController.tanentLogin);
        this.router.post('/login', RequestHandler.handle(collection), UserController.login);

        const commonMiddleWare = [Middlewares.isAuthenticated, Middlewares.verifyToken, RequestHandler.handle(collection)];

        this.router.post('/refresh/token', Middlewares.isAuthenticated, Middlewares.verifyRefreshToken, RequestHandler.handle(collection), UserController.refreshToken);

        this.router.post('', ...commonMiddleWare, Middlewares.requestValidator(Middlewares.RequestValidatorRules['user.create']), Middlewares.checkRouteIsAccessible([UserRoles.SUPERADMIN, UserRoles.DEFAULT_SUPERADMIN]), UserController.create);

        this.router.get('', ...commonMiddleWare, Middlewares.checkRouteIsAccessible([UserRoles.ADMIN, UserRoles.SUPERADMIN, UserRoles.DEFAULT_SUPERADMIN]), BaseController.get);

        this.router.put('/me', Middlewares.requestValidator(Middlewares.RequestValidatorRules['user.update']), ...commonMiddleWare, UserController.updateTanentProfile);
        this.router.get('/me', ...commonMiddleWare, UserController.getProfile);
        this.router.put('/tanent/:id',  Middlewares.requestValidator(Middlewares.RequestValidatorRules['user.update']),...commonMiddleWare, BaseController.updateById);
        this.router.post('/tanent/:action(verify)', Middlewares.requestValidator(Middlewares.RequestValidatorRules['user.tanent.verify']),...commonMiddleWare,  Middlewares.checkRouteIsAccessible([UserRoles.TANENT, UserRoles.LEAD]), UserController.tanentLogin);

        return this.router;
    }

}