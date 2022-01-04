import User from '../models/User';
import Role from '../models/Role';
import RefreshToken from '../models/RefreshToken';
import { v4 as uuid } from 'uuid';
import jwt from 'jsonwebtoken';
import error_types from '../libs/error_types';
import { addHours } from 'date-fns';

export default class AuthController {

    generateToken = (user) => {
        const payload = {
            sub: user._id,
            name: user.first_name && user.email
        }

        return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '15m'});
    }

    login = async (req, res, next) => {
        const { email, password, fingerprint } = req.body;

        if(!email || !password || email === '' || password === '') {
            return next(new error_types.InfoError("There are blank fields"));
        }

        const user = await User.findOne({ email, active: true });

        if(!user) return next( new error_types.FORBIDDEN("The username or password are incorrect"));

        const match = await user.checkPassword(password);

        if(!match) {

            user.loginAttempts += 1;

            if(user.loginAttempts >= 5) {
                user.blockedAt = addHours(new Date(), 6);
                await user.save();

                return next(new error_types.InfoError("The user has been blocked"))
            }

            await user.save();
            return next(new error_types.FORBIDDEN("The username or password are incorrect"));
        }

        if(new Date(user.blockedAt) > new Date(Date.now())) {
            return next(new error_types.FORBIDDEN("The user is blocked"))
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
        const { session: rtoken } = req.cookies;

        if(!rtoken) {
            res.clearCookie('session');
            return next(new error_types.FORBIDDEN("Session doesn't exist"));
        }

        const refreshToken = await RefreshToken.findOne({refresh_token: rtoken, fingerprint});

        if(!refreshToken) {
            res.clearCookie('session');
            await RefreshToken.deleteOne( {refresh_token: rtoken });
            return next(new error_types.FORBIDDEN("Session doesn't exist"));
        }

        const user = await User.findById(refreshToken.user);

        if(!user) {
            res.clearCookie('session');
            await RefreshToken.deleteOne( {refresh_token: rtoken });
            return next(new error_types.NOT_FOUND("There is no user associated with this session"));
        }

        refreshToken.last_refresh = new Date(Date.now());

        await refreshToken.save()
        const token = this.generateToken(user);

        res.json({ access_token: token });
    }

    logout = async (req, res) => {
        const user = req.user;
        const { session: rtoken } = req.cookies;

        await RefreshToken.deleteOne({ user: user._id, refresh_token: rtoken });
        res.clearCookie('session');

        res.status(204).json();
    }

    closeSession = async(req, res) => {
        const user = req.user;
        const { rtoken } = req.body;

        await RefreshToken.deleteOne({ user: user._id, _id: rtoken });

        res.status(204).json();
    }

    getProfile = async (req, res) => {
        const user = await User.findById(req.user._id).select('-password -loginAttempts')
        .populate({
            path: 'role',
            select: '-_id'
        });

        res.json({user});

    }

    getUsers = async (req, res) => {
        const users = await User.find().select('-password');

        res.json(users);
    }

    getAllSessions = async (req, res) => {
        const user = req.user;

        const sessions = await RefreshToken.find({ user: user._id }).select('-fingerprint -updatedAt -createdAt -user');

        res.json(sessions);
    }

    signin = async (req, res, next) => {
        const { email, first_name, last_name, password } = req.body;

        const checkEmail = await User.findOne({ email });

        if(!checkEmail) {
            const role = await Role.findOne({ name: 'user' });
            const newUser = new User({
                email,
                first_name,
                last_name,
                password,
                role
            });

            await newUser.save();

            res.status(204).json();
        } else {
            return next(new error_types.CONFLICT('Email already exists'))
        }
    }

    modifyUser = async (req, res, next) => {
        const { id } = req.params;
        const user = req.user;

        const { email, first_name, last_name, role } = req.body;

        const user = await User.findOne({ _id: id });

        if(user) {
            user.email = email || user.email;
            user.first_name = first_name || user.first_name;
            user.last_name = last_name || user.last_name;
            user.role = role || user.role;

            await user.save();

            res.status(204).json();
        } else {
            return next(new error_types.NOT_FOUND('There is no user with that ID '));
        }
    }

    deleteUser = async (req, res) => {
        const { id } = req.params;

        await User.deleteOne({ _id: id });

        res.status(204).json();
    }

    changePassword = async (req, res, next) => {
        const { oldPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id);

        if(user) {
            const checkPassword = await user.checkPassword(oldPassword);

            if(checkPassword) {
                user.password = newPassword;

                await user.save();

                res.status(204).json();
            } else {
                return next(new error_types.UNAUTHORIZED('Password is incorrect'));
            }
        } else {
            return next(new error_types.NOT_FOUND('There is no user with that ID'));
        }
    }

    getRoles = async (req, res) => {
        const roles = await Role.find();

        res.json(roles); 
    }

    createRole = async (req, res, next) => {
        const { name, permissions } = req.body;

        if(!name || permissions.length <= 0) {
            return next(new error_types.BAD_REQUEST('Missing required data'));
        }

        const match = await Role.findOne({ name });

        if(!match) {
            const newRole = new Role({ name, permissions });

            await newRole.save();

            res.status(204).json();
        } else {
            return next(new error_types.CONFLICT('A role with that name already exists'));
        }

    }

    modifyRole = async (req, res, next) => {
        const { id } = req.params;
        const { permissions } = req.body;

        const role = await Role.findById(id);

        if(role) {
            role.permissions = permissions;

            await role.save();

            res.status(204).json();
        } else {
            return next(new error_types.NOT_FOUND('There is no role with that ID'));
        }
    }

    deleteRole = async (req, res) => {
        const { id } = req.params;

        await Role.deleteOne({ _id: id });

        res.status(204).json();
    }
    
}