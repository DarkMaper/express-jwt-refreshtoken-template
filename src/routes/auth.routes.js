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
        this.router.post('/signup', this.authController.signin);
        this.router.get('/getSessions', isAuthenticated, this.authController.getAllSessions);
        this.router.post('/refresh', this.authController.refreshToken);
        this.router.get('/logout', isAuthenticated, this.authController.logout);
        this.router.delete('/closeSession', isAuthenticated,this.authController.closeSession);
        this.router.get('/profile', isAuthenticated, this.authController.getProfile);

        this.router.put('/changePassword', isAuthenticated, this.authController.changePassword);

        this.router.get('/getUsers', isAuthenticated, permissions(['users.get']), this.authController.getUsers);
        this.router.post('/createUser', isAuthenticated, permissions(['users.create']), this.authController.createUser);
        this.router.put('/modifyUser/:id', isAuthenticated, permissions(['users.modify']), this.authController.modifyUser);
        this.router.delete('/deleteUser/:id', isAuthenticated, permissions(['users.delete']), this.authController.deleteUser);

        this.router.get('/getRoles', isAuthenticated, permissions(['roles.get']), this.authController.getRoles);
        this.router.post('/createRole', isAuthenticated, permissions(['roles.create']), this.authController.createRole);
        this.router.put('/modifyRole/:id', isAuthenticated, permissions(['roles.modify']), this.authController.modifyRole);
        this.router.delete('/deleteRole/:id', isAuthenticated, permissions(['roles.delete']), this.authController.deleteRole);
    }
}