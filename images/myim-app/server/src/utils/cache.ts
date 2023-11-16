import { CustomRequest } from '../model/request.model';
import express from 'express';
import Constants from './constants';
import { ResponseHandler } from './response.handler';
import * as redis from 'redis';
import { promisify } from 'util';
import logger from './logger';

const redisClient = redis.createClient();
redisClient.connect();
redisClient.on('error', (err) => {

    logger.info('Redis Client Error', err)
});



export module Cache {
    // Middleware function for Redis caching
    export function response(expire: number) {
        return async function (req: CustomRequest, res: express.Response, next: express.NextFunction) {

            if (parseInt(process.env.ENABLE_CACHE as string) === 1 && redisClient.isOpen) {
                const { url } = req;
                const { id }: any = req.user;

                const responseHandler = new ResponseHandler(res);
                const cacheKey = [id, url].join(Constants.REDIS_SEPERATOR);
                try {
                    const cachedResponse = await redisClient.get(cacheKey)
                    if (cachedResponse) {
                        logger.info(`Sending cached response for the ${cacheKey}`)
                        res.send(JSON.parse(cachedResponse));
                    } else {
                        const send = res.send;
                        res.send = (body: any): any => {
                            const responseBody = JSON.stringify(body);
                            redisClient.setEx(cacheKey, expire, responseBody);
                            res.send = send;
                            responseHandler.handleSuccess(body);
                        };
                        next();
                    }
                } catch (error) {
                    logger.error('Error fetching data from Redis:', error);
                    next();
                }
            }
            else {
                next();
            }

        };
    }
}
