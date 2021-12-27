import 'dotenv/config';
import 'regenerator-runtime/runtime';
import 'core-js/stable';
import '@babel/register';


import './database';
import App from './server';

function bootstrap() {
    const app = new App();
    app.listen();
}
bootstrap();