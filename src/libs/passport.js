import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import passport from 'passport';
import User from "../models/User";

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
}

passport.use(new JwtStrategy(opts, async (payload, done) => {
    try {
        const user = await User.findById(payload.sub);

        if(!user) return done(null, false)

        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}))