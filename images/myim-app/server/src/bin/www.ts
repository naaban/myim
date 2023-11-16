#!/usr/bin/env node
/**
 * Module dependencies.
 */
import * as dotenv from 'dotenv';
dotenv.config()
import Server from '..';
import logger from '../utils/logger';
import { DatabaseClient } from '../utils/database';


(async function () {
    if (await DatabaseClient.init()) {
        /**
         * Get port from environment and store in Express.
         */
        const port = process.env.PORT || 3000;
        const expressServer = new Server();

        expressServer.app.set('port', process.env.PORT || 3000)
        /**
         * Create HTTP server.
         */

        const server = await expressServer.start();

        /**
         * Listen on provided port, on all network interfaces.
         */

        server.listen(port);
        server.on('error', onError);
        server.on('listening', onListening);

        /**
         * Event listener for HTTP server "error" event.
         */

        function onError(error: any) {
            if (error.syscall !== 'listen') {
                throw error;
            }

            var bind = typeof port === 'string'
                ? 'Pipe ' + port
                : 'Port ' + port;

            // handle specific listen errors with friendly messages
            switch (error.code) {
                case 'EACCES':
                    logger.error(bind + ' requires elevated privileges');
                    process.exit(1);
                    break;
                case 'EADDRINUSE':
                    logger.error(bind + ' is already in use');
                    process.exit(1);
                    break;
                default:
                    throw error;
            }
        }

        /**
         * Event listener for HTTP server "listening" event.
         */

        function onListening() {
            var addr = server.address();
            var bind = typeof addr === 'string'
                ? 'pipe ' + addr
                : 'port ' + addr?.port;
            logger.info('Listening on ' + bind);
        }
    }
    else {
        logger.info('Database connection failed!');
        process.exit(1);
    }
})();