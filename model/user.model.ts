import { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
    clerkId: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['manager', 'editor', 'admin'],
        default: 'manager'
    },
    avatar: {
        type: String,
    }
}, {
    collection: 'users',
    timestamps: true
});

const User = models?.User || model("User", UserSchema);
export default User;