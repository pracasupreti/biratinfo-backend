import mongoose, { Schema, Document, models, model } from 'mongoose';

interface IComment {
    _id?: string;
    userId: string;
    name: string;
    avatar?: string;
    content: string;
    createdAt: Date;
}

interface IPostInteraction extends Document {
    postId: string;
    claps: string[]; // array of user IDs who clapped
    comments: IComment[];
}

const CommentSchema = new Schema<IComment>({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    avatar: { type: String },
    content: { type: String, required: true, maxlength: 500 },
    createdAt: { type: Date, default: Date.now }
});

const PostInteractionSchema = new Schema<IPostInteraction>({
    postId: { type: String, required: true, unique: true },
    claps: { type: [String], default: [] },
    comments: {
        type: [CommentSchema],
        default: [],
        validate: {
            validator: (comments: IComment[]) => comments.length <= 10,
            message: 'Maximum 10 comments allowed per post'
        }
    }
}, {
    collection: 'PostInteraction',
    timestamps: true,
});

const PostInteraction = models?.PostInteraction<IPostInteraction> || model<IPostInteraction>("PostInteraction", PostInteractionSchema)
export default PostInteraction