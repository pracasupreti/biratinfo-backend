import mongoose, { models } from 'mongoose';

const PostSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    categoryId: { type: String },
    status: { type: String, required: true },
    englishTitle: { type: String, required: true },
    nepaliTitle: { type: String, required: true },
    blocks: [{ type: String }],
    excerpt: { type: String, required: true },
    featuredIn: [{ type: Boolean }],
    postInNetwork: [{ type: Boolean }],
    category: { type: String, required: true },
    tags: { type: String },
    date: { type: String },
    time: { type: String },
    author: { type: String },
    language: { type: String },
    readingTime: { type: String },
    heroBanner: { type: String || null },
    ogBanner: { type: String || null },
    imageCredit: { type: String },
    sponsoredAds: { type: String, default: 'https://res.cloudinary.com/biratinfo/image/upload/v1749053676/posts/9d870052-32f7-408a-8cf7-394a483edbe9.jpg' },
    access: { type: String },
    audioFile: { type: Buffer },
    canonicalUrl: { type: String },
}, {
    collection: 'posts',
    timestamps: true,
});

const Post = models?.Post || mongoose.model('Post', PostSchema);
export default Post;
