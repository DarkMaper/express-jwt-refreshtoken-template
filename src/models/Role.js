import { model, Schema } from 'mongoose';

const RoleSchema = new Schema({
    name: { type: String, required: true },
    permissions: [{ type: String }]
})

export default model('Role', RoleSchema);