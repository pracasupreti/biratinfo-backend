import mongoose, { models } from 'mongoose';

const AdvertisementSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        enum: ['header_banner', 'sponsor_banner'],
    },
    category: {
        type: String,
    },
    link: {
        type: String,
    },
    status: {
        type: String,
        enum: ['active', 'inactive']
    }
}, { timestamps: true });

const Advertisement = models?.Advertisement || mongoose.model('Advertisement', AdvertisementSchema);

export default Advertisement;