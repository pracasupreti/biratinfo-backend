import mongoose, { models } from 'mongoose';

const PostSchema = new mongoose.Schema({
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
    heroBanner: { type: String || null },
    ogBanner: { type: String || null },
    imageCredit: { type: String },
    sponsoredAds: { type: String },
    access: { type: String },
    audioFile: { type: Buffer },
    canonicalUrl: { type: String },
}, {
    collection: 'publicPosts',
    timestamps: true,
});

const PublicPost = models?.Post || mongoose.model('PublicPost', PostSchema);
export default PublicPost;
