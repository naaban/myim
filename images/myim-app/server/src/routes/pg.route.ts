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
const pgCollection: ICollectionModel = { collectionName: Constants.COLLECTIONS.PG }
const pgExpenseCollection: ICollectionModel = { collectionName: Constants.COLLECTIONS.PG_EXPENSES }
const roomsCollection: ICollectionModel = { collectionName: Constants.COLLECTIONS.PG_ROOMS }
const roomFacilitiesCollection: ICollectionModel = { collectionName: Constants.COLLECTIONS.PG_ROOM_FACILITIES }



export class PgRoute {
    private router: Router
    constructor() {
        this.router = Router();
    }
    addRoutes() {
        const commonMiddleWares = [Middlewares.isAuthenticated, Middlewares.verifyToken];
        this.router.post('', Middlewares.requestValidator(Middlewares.RequestValidatorRules['pg.create']), commonMiddleWares, Middlewares.checkRouteIsAccessible([UserRoles.ADMIN, UserRoles.SUPERADMIN, UserRoles.DEFAULT_SUPERADMIN]), RequestHandler.handle(pgCollection), BaseController.create);
        this.router.get('', commonMiddleWares, Middlewares.checkRouteIsAccessible([UserRoles.ADMIN, UserRoles.SUPERADMIN, UserRoles.DEFAULT_SUPERADMIN, UserRoles.TANENT]), RequestHandler.handle(pgCollection), BaseController.get);
        this.router.put('/:id', Middlewares.requestValidator(Middlewares.RequestValidatorRules['pg.update']), commonMiddleWares, Middlewares.checkRouteIsAccessible([UserRoles.ADMIN, UserRoles.SUPERADMIN, UserRoles.DEFAULT_SUPERADMIN]), RequestHandler.handle(pgCollection), BaseController.updateById);
        this.router.delete('/:id', commonMiddleWares, Middlewares.checkRouteIsAccessible([UserRoles.ADMIN, UserRoles.SUPERADMIN, UserRoles.DEFAULT_SUPERADMIN]), RequestHandler.handle(pgCollection), BaseController.deleteById);



        this.router.post('/expense', Middlewares.upload.single('file'), commonMiddleWares, Middlewares.checkRouteIsAccessible([UserRoles.ADMIN]), RequestHandler.handle(pgExpenseCollection), BaseController.create);
        this.router.get('/expenses', commonMiddleWares, Middlewares.checkRouteIsAccessible([UserRoles.ADMIN, UserRoles.SUPERADMIN, UserRoles.DEFAULT_SUPERADMIN]), RequestHandler.handle(pgExpenseCollection), BaseController.get);
        this.router.get('/expense/:id', commonMiddleWares, Middlewares.checkRouteIsAccessible([UserRoles.SUPERADMIN, UserRoles.DEFAULT_SUPERADMIN]), RequestHandler.handle(pgExpenseCollection), BaseController.updateById);

        this.router.post('/room', Middlewares.requestValidator(Middlewares.RequestValidatorRules['pg.room.create']), commonMiddleWares, Middlewares.checkRouteIsAccessible([UserRoles.ADMIN, UserRoles.SUPERADMIN, UserRoles.DEFAULT_SUPERADMIN]), RequestHandler.handle(roomsCollection), BaseController.create);
        this.router.get('/rooms', commonMiddleWares, Middlewares.checkRouteIsAccessible([UserRoles.ADMIN, UserRoles.SUPERADMIN, UserRoles.DEFAULT_SUPERADMIN, UserRoles.TANENT]), RequestHandler.handle(roomsCollection), BaseController.get);
        this.router.put('/room/:id', Middlewares.requestValidator(Middlewares.RequestValidatorRules['pg.room.update']), commonMiddleWares, Middlewares.checkRouteIsAccessible([UserRoles.ADMIN, UserRoles.SUPERADMIN, UserRoles.DEFAULT_SUPERADMIN]), RequestHandler.handle(roomsCollection), BaseController.updateById);
        this.router.delete('/room/:id', commonMiddleWares, Middlewares.checkRouteIsAccessible([UserRoles.ADMIN, UserRoles.SUPERADMIN, UserRoles.DEFAULT_SUPERADMIN]), RequestHandler.handle(roomsCollection), BaseController.deleteById);

        this.router.post('/room/facility', Middlewares.requestValidator(Middlewares.RequestValidatorRules['pg.room.facility.create']), commonMiddleWares, Middlewares.checkRouteIsAccessible([UserRoles.DEFAULT_SUPERADMIN]), RequestHandler.handle(roomFacilitiesCollection), Middlewares.removeIdsFromRequest, BaseController.create);
        this.router.get('/room/facilities', commonMiddleWares, Middlewares.checkRouteIsAccessible([UserRoles.SUPERADMIN, UserRoles.ADMIN, UserRoles.DEFAULT_SUPERADMIN]), RequestHandler.handle(roomFacilitiesCollection), Middlewares.removeIdsFromRequest, BaseController.get);
        this.router.put('/room/facility/:id', Middlewares.requestValidator(Middlewares.RequestValidatorRules['pg.room.facility.update']), commonMiddleWares, Middlewares.checkRouteIsAccessible([UserRoles.DEFAULT_SUPERADMIN]), RequestHandler.handle(roomFacilitiesCollection), Middlewares.removeIdsFromRequest, BaseController.updateById);
        this.router.delete('/room/facility/:id', Middlewares.requestValidator(Middlewares.RequestValidatorRules['pg.room.facility.delete']), commonMiddleWares, Middlewares.checkRouteIsAccessible([UserRoles.DEFAULT_SUPERADMIN]), RequestHandler.handle(roomFacilitiesCollection), Middlewares.removeIdsFromRequest, BaseController.deleteById);

        return this.router;


    }

}