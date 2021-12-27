import AuthController from "../controllers/auth.controller";
import { Router } from "express";
import { isAuthenticated, permissions } from "../middlewares/guard";

export default class AuthRouter {
    constructor() {
        this.router = Router();
        this.authController = new AuthController();

        this.initRoutes();
    }

    initRoutes() {
        this.router.post('/signin', this.authController.login);
        this.router.get('/sessions', isAuthenticated, this.authController.getAllSessions);
        this.router.post('/refresh', this.authController.refreshToken);
        this.router.get('/logout', isAuthenticated, this.authController.logout);
        this.router.delete('/closeSession', isAuthenticated,this.authController.closeSession);
        this.router.get('/profile', isAuthenticated, this.authController.getProfile);

        this.router.get('/users', isAuthenticated, permissions(['users.get']), this.authController.getUsers);
    }
}