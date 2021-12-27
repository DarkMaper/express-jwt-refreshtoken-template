import { model, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

const UserSchema = new Schema({
    email: { type: String, unique: true },
    first_name: { type: String },
    last_name: { type: String },
    password: { type: String, required: true },
    loginAttempts: { type: Number, default: 0 },
    blockedAt: { type: Date, default: Date.now },
    role: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
    active: { type: Boolean, default: true },
    lastLogin: { type: Date }
}, {
    timestamps: true,
    versionKey: false
})

UserSchema.pre('save', async function(next) {
    const user = this;

    if(!user.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(12);
        const hash = await bcrypt.hash(user.password, salt);
        user.password = hash;
        return next();
    } catch (error) {
        return next(error);
    }
})

UserSchema.methods.checkPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
}

export default model('User', UserSchema);