import mongoose, { models, Schema } from 'mongoose';

const CategorySchema = new Schema({
    category: { type: String, required: true, unique: true },
    posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    postCount: { type: Number, default: 0 },
    status: { type: String },
});

const Category = models?.Category || mongoose.model('Category', CategorySchema);
export default Category
