import mongoose, { models } from 'mongoose';

const PostSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    categoryId: { type: String },
    status: {
        type: String,
        required: true,
        enum: ['draft', 'pending', 'approved', 'rejected', 'scheduled']
    },
    englishTitle: { type: String, required: true },
    nepaliTitle: { type: String, required: true },
    blocks: [{
        content: { type: String, required: true }
    }],
    excerpt: { type: String, required: true },
    featuredIn: [{ type: Boolean }],
    postInNetwork: [{ type: Boolean }],
    category: { type: String, required: true },
    tags: {
        type: [String],
        validate: {
            validator: function (tags: string[]) {
                return tags.length <= 5;
            },
            message: 'A post cannot have more than 5 tags'
        }
    },
    date: { type: String },
    time: { type: String },
    authors: {
        type: [
            {
                type: String,
                ref: 'User'
            }],
        validate: {
            validator: function (authors: string[]) {
                return authors.length <= 2;
            },
            message: 'A post cannot have more than 2 authors'
        }
    },
    language: { type: String },
    readingTime: { type: String },
    heroBanner: { type: String, default: null },
    ogBanner: { type: String, default: null },
    heroImageCredit: { type: String },
    ogImageCredit: { type: String },
    sponsoredAds: {
        type: String,
        default: 'https://res.cloudinary.com/biratinfo/image/upload/v1749053676/posts/9d870052-32f7-408a-8cf7-394a483edbe9.jpg'
    },
    access: { type: String },
    audioFile: { type: Buffer },
    canonicalUrl: { type: String },
}, {
    collection: 'posts',
    timestamps: true,
});

const Post = models?.Post || mongoose.model('Post', PostSchema);
export default Post;