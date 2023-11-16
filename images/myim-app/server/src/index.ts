import express from 'express';
import * as https from 'https';
import * as selfsigned from 'selfsigned';
import * as path from 'path';
import * as bodyParser from 'body-parser';
import * as fs from 'node:fs/promises'
import cookieParser from 'cookie-parser';
import { ErrorHandler } from './utils/error.handler';
import { IndexRoute } from './routes';
import { UserRoute } from './routes/user.route';
import logger from './utils/logger';
import { PgRoute } from './routes/pg.route';
import { PgAllocateRoute } from './routes/allocate.route';
import { RabbitMQ } from './utils/rabbitmq';
import { PaymentRoute } from './routes/payment.route';
const queryMapper = require('./utils/query.mapper.json')
class Server {
    public app: express.Application;
    static CERT_PATH = '/certs';
    constructor() {
        this.app = express();
        logger.info("Data")

    }
    private async config() {
        await this.listenQueues()
        this.app.use(bodyParser.json());
        this.app.use(cookieParser());
        await this.createCertificate();
        this.routes();
    }


    private async listenQueues() {
        await RabbitMQ.subscribe(Object.keys(queryMapper))
    }
    private async createCertificate() {
        try {
            await fs.access(Server.CERT_PATH);
            logger.info(`Directory exists ${Server.CERT_PATH}`)

        }
        catch (err) {
            await fs.mkdir(Server.CERT_PATH);

            logger.info(`Created directory ${Server.CERT_PATH}`)
        }


        const privateKeyPath = path.join(Server.CERT_PATH, 'private.key');

        try {
            await fs.access(privateKeyPath)
            await this.setCertificates();
        }
        catch (err) {
            const attrs = [{ name: 'commonName', value: 'localhost' }];
            const pems = selfsigned.generate(attrs, {
                keySize: 2048,
                days: 365,
            } as any) as any;
            fs.writeFile(privateKeyPath, pems.private);
            fs.writeFile(path.join(Server.CERT_PATH, 'public.key'), pems.public);
            fs.writeFile(path.join(Server.CERT_PATH, 'cert.crt'), pems.cert);

            await this.setCertificates();
        }
    }
    private async setCertificates() {
        process.env.SSL_PRIVATE_KEY = await fs.readFile(path.join(Server.CERT_PATH, 'private.key'), 'utf8');
        process.env.SSL_CERTIFICATE = await fs.readFile(path.join(Server.CERT_PATH, 'cert.crt'), 'utf8');
        process.env.SSL_PUBLIC_KEY = await fs.readFile(path.join(Server.CERT_PATH, 'public.key'), 'utf8');
    }

    private routes() {
        const router = express.Router();
        const indexRoute = new IndexRoute();
        const userRoute = new UserRoute();
        const pgRoute = new PgRoute();
        const pgAllocateRouter = new PgAllocateRoute();
        const paymentRouter = new PaymentRoute();
        router.get('/api', indexRoute.index);
        router.use('/api/user', userRoute.addRoutes());
        router.use('/api/pg', pgRoute.addRoutes());
        router.use('/api/pg/allocate', pgAllocateRouter.addRoutes());
        router.use('/api/payment', paymentRouter.addRoutes());
        this.app.use(router);
        this.app.use(new ErrorHandler().handle.bind(this));
    }
    public async start() {
        await this.config();
        logger.info(`Cerficate path ${Server.CERT_PATH}`)
        const key = await fs.readFile(path.join(Server.CERT_PATH, 'privkey.pem'));
        const cert = await fs.readFile(path.join(Server.CERT_PATH, 'fullchain.pem'));
        const options = {
            key,
            cert,
        };
        return https.createServer(options, this.app);
    }
}

export default Server;
