import mongoose, { models } from 'mongoose';

const ImageDataSchema = new mongoose.Schema({
    url: { type: String },
    public_id: { type: String }
});

const CTASchema = new mongoose.Schema({
    name: { type: String },
    url: { type: String }
});

const AudioDataSchema = new mongoose.Schema({
    url: { type: String },
    public_id: { type: String },
    duration: { type: Number }
});



const PostSchema = new mongoose.Schema({
    // Core Fields
    title: { type: String, required: true },
    excerpt: { type: String, required: true },
    isNepali: { type: Boolean, default: false },
    content: { type: String, required: true },
    featuredIn: [{ type: String }],
    postInNetwork: [{ type: String }],

    // Media Fields
    heroBanner: { type: ImageDataSchema },
    ogBanner: { type: ImageDataSchema },
    heroImageCredit: { type: String, default: '' },
    ogImageCredit: { type: String, default: '' },
    audio: { type: AudioDataSchema },
    audioCredit: { type: String, default: '' },
    sponsoredAds: {
        type: ImageDataSchema, default: {
            url: 'https://res.cloudinary.com/biratinfo/image/upload/v1751554796/advertisement_rnj6jy.jpg',
            public_id: 'default_ad'
        }
    },
    // Call to Action
    ctas: [CTASchema],

    // Other Fields
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
        type: [String],
        validate: {
            validator: function (authors: string[]) {
                return authors.length <= 2;
            },
            message: 'A post cannot have more than 2 authors'
        }
    },
    language: { type: String },
    readingTime: { type: String },
    access: { type: String },
    canonicalUrl: { type: String },

    // Status and ownership
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ['draft', 'pending', 'approved', 'rejected', 'scheduled'],
        default: 'draft'
    },
    categoryId: { type: String }
}, {
    collection: 'posts',
    timestamps: true,
});

const Post = models?.Post || mongoose.model('Post', PostSchema);
export default Post;