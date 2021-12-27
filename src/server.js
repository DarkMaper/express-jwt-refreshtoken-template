import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import useragent from 'express-useragent';

import { AuthRouter } from './routes';

import errorHandler from './middlewares/error_handler';

import './libs/passport';

export default class App {
    constructor() {
        this.app = express();
        this.authRouter = new AuthRouter();

        this.middlewares();
        this.routes();
        this.handlers();
    }

    middlewares() {
        this.app.use(morgan('dev'));
        this.app.use(helmet());
        this.app.use(cors({
            credentials: true,
            origin: 'http://localhost:8080'
        }));
        this.app.use(express.urlencoded( { extended: false }));
        this.app.use(express.json());
        this.app.use(cookieParser());
        this.app.use(useragent.express());
    }

    handlers() {
        this.app.use(errorHandler);
    }

    routes() {
        this.app.use('/api/v1/auth', this.authRouter.router);
    }


    listen(listen_port = 3000) {
        const port = process.env.PORT || listen_port;
        this.app.listen(port);
        console.info("Server listening in port", port);
    }
}