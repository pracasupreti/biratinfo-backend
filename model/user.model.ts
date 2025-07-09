import { Schema, model, models } from "mongoose";

const SocialLinksSchema = new Schema({
    facebook: { type: String },
    instagram: { type: String },
    twitter: { type: String },
    youtube: { type: String },
    tiktok: { type: String }
});

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
    username: {
        type: String
    },
    role: {
        type: String,
        enum: ['manager', 'editor', 'admin'],
        default: 'manager'
    },
    avatar: {
        type: String,
    },
    bio: {
        type: String,
        maxlength: 500
    },
    socialLinks: {
        type: SocialLinksSchema,
        default: {}
    }
}, {
    collection: 'users',
    timestamps: true
});

const User = models?.User || model("User", UserSchema);
export default User;