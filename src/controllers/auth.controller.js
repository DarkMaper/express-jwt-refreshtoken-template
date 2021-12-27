import User from '../models/User';
import Role from '../models/Role';
import RefreshToken from '../models/RefreshToken';
import { v4 as uuid } from 'uuid';
import jwt from 'jsonwebtoken';
import error_types from '../libs/error_types';
import { addHours } from 'date-fns';

export default class AuthController {

    generateToken(user) {
        const payload = {
            sub: user._id,
            name: user.first_name && user.email
        }

        return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '15m'});
    }

    login = async (req, res, next) => {
        const { email, password, fingerprint } = req.body;

        if(!email || !password ) {
            return next(new error_types.InfoError("No se han rellenado todos los campos"));
        }

        if(!fingerprint) {
            return next(new error_types.InfoError("No se ha podido validar el navegador"));
        }

        const user = await User.findOne({ email, active: true });

        if(!user) return next( new error_types.FORBIDDEN("El usuario o la contraseña no son correctos"));

        const match = await user.checkPassword(password);

        if(!match) {

            user.loginAttempts += 1;

            if(user.loginAttempts >= 5) {
                user.blockedAt = addHours(new Date(), 6);
                await user.save();

                return next(new error_types.InfoError("El usuario ha sido bloqueado"))
            }

            await user.save();
            return next(new error_types.FORBIDDEN("El usuario o la contraseña no son correctos"));
        }

        if(new Date(user.blockedAt) > new Date(Date.now())) {
            return next(new error_types.FORBIDDEN("El usuario está bloqueado"))
        }

        user.loginAttempts = 0;
        user.lastLogin = new Date(Date.now());

        const token = this.generateToken(user);
        const refreshToken = new RefreshToken({
            user: user._id,
            refresh_token: uuid(),
            fingerprint,
            last_refresh: new Date(Date.now()),
            os: req.useragent['os'],
            platform: req.useragent['platform'],
            browser: req.useragent['browser']
        });

        await refreshToken.save();

        res
        .cookie('session', refreshToken.refresh_token, { httpOnly: true })
        .json({ access_token: token });
    }

    refreshToken = async(req, res, next) => {
        const rtoken = req.cookies['session'];
        const fingerprint = req.body.fingerprint;

        if(!rtoken) {
            res.clearCookie('session');
            return next(new error_types.FORBIDDEN("No existe ninguna sesión"));
        }

        const refreshToken = await RefreshToken.findOne({refresh_token: rtoken, fingerprint});

        if(!refreshToken) {
            res.clearCookie('session');
            await RefreshToken.deleteOne( {refresh_token: rtoken });
            return next(new error_types.FORBIDDEN("No existe ninguna sesión"));
        }

        const user = await User.findById(refreshToken.user);

        if(!user) {
            res.clearCookie('session');
            await RefreshToken.deleteOne( {refresh_token: rtoken });
            return next(new error_types.NOT_FOUND("No existe ningún usuario asociado a esta sesión"));
        }

        refreshToken.last_refresh = new Date(Date.now());

        await refreshToken.save()
        const token = this.generateToken(user);

        res.json({ access_token: token });
    }

    logout = async (req, res) => {
        const user = req.user;
        const rtoken = req.cookies['session'];

        await RefreshToken.deleteOne({ user: user._id, refresh_token: rtoken });
        res.clearCookie('session');

        res.status(204).json();
    }

    closeSession = async(req, res) => {
        const user = req.user;
        const rtoken = req.body['rtoken'];

        await RefreshToken.deleteOne({ user: user._id, _id: rtoken });

        res.status(204).json();
    }

    getProfile = async (req, res) => {
        const user = await User.findById(req.user._id).select('-password').populate('role');

        res.json({user});

    }

    async getUsers(req, res) {
        const users = await User.find().select('-password');

        res.json(users);
    }

    async getAllSessions(req, res) {
        const user = req.user;

        const sessions = await RefreshToken.find({ user: user._id }).select('-fingerprint -updatedAt -createdAt -user');

        res.json(sessions);
    }
}