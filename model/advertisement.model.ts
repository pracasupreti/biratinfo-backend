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
        unique: true // Ensures only one document per banner type
    }
}, { timestamps: true });

const Advertisement = models?.Advertisement || mongoose.model('Advertisement', AdvertisementSchema);

export default Advertisement;