import passport from 'passport';
import error_types from '../libs/error_types';
import Role from '../models/Role';
import User from '../models/User';

export function isAuthenticated(req, res, next) {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if(info) return next(new error_types.UNAUTHORIZED(info.message));

        if(err) return next(err);

        if(!user) return next(new error_types.FORBIDDEN("No tienes permisos para acceder a este recurso"))

        req.user = user;
        next();
    })(req, res, next)
}

/**
 * 
 * @param {string[]} perm Array of permissions
 * @returns 
 */
export function permissions(perm) {
    return async (req, res, next) => {
        const role = await Role.findById(req.user.role);
        const permissions = role.permissions;

        for(let permission of permissions) {
            const permReg = permission === '*' ? '.*' : permission;
            const re = new RegExp(permReg, 'g');
            
            const index = perm.findIndex(value => re.test(value));

            if(index >= 0) {
                return next();
            }
        }
        next( new error_types.UNAUTHORIZED("No tienes los permisos suficientes para acceder a este recurso") );
    }
}