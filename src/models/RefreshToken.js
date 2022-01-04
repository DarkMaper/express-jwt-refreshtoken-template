import { model, Schema } from "mongoose";
import validator from 'validator';

const RefreshTokenSchema = new Schema({
    refresh_token: { type:String, validator: validator.isUUID, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    last_refresh: { type: Date },
    os: { type: String },
    platform: { type: String },
    browser: { type: String }
},
{
    timestamps: true,
    versionKey: false
}
)

export default model ('RefreshToken', RefreshTokenSchema);