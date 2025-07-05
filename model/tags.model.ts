import mongoose from 'mongoose';

const tagSchema = new mongoose.Schema({
    en: { type: String, default: null },
    np: { type: String, default: null },
    count: { type: Number, default: 0 },
}, {
    timestamps: true,
    collection: 'tags'
});

const Tag = mongoose.models?.Tag || mongoose.model('Tag', tagSchema);
export default Tag;
