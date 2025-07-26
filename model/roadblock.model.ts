import mongoose, { Document, models } from 'mongoose';

export interface IRoadblockBanner extends Document {
    link: string;
    image: {
        url: string;
        publicId: string;
    };
    closeButtonDelay: number;
    bannerTimeDelay: number;
    repeat: 'never' | 'daily' | 'weekly' | 'monthly' | 'yearly';
    networks: 'all' | string[];
    location: 'homepage' | 'article' | 'both';
    devices: 'mobile' | 'tablet' | 'desktop' | 'all';
    hideForLoggedIn: boolean;
    startDate: Date;
    endDate: Date | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const RoadblockBannerSchema = new mongoose.Schema({
    link: {
        type: String,
        required: true,
        trim: true,
        match: [/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/, 'Please enter a valid URL']
    },
    image: {
        url: {
            type: String,
            required: true
        },
        publicId: {
            type: String,
            required: true
        }
    },
    closeButtonDelay: {
        type: Number,
        required: true,
        default: 5,
        min: 0,
        max: 60
    },
    bannerTimeDelay: {
        type: Number,
        required: true,
        default: 5,
        min: 0,
        max: 300
    },
    repeat: {
        type: String,
        required: true,
        enum: ['never', 'daily', 'weekly', 'monthly', 'yearly'],
        default: 'never'
    },
    networks: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
        validate: {
            validator: function (value: any) {
                return value === 'all' ||
                    (Array.isArray(value) && value.length > 0 && value.every((v: any) => typeof v === 'string'));
            },
            message: 'Networks must be "all" or an array of network strings'
        },
        default: 'all'
    },
    location: {
        type: String,
        required: true,
        enum: ['homepage', 'article', 'both'],
        default: 'homepage'
    },
    devices: {
        type: String,
        required: true,
        enum: ['mobile', 'tablet', 'desktop', 'all'],
        default: 'desktop'
    },
    hideForLoggedIn: {
        type: Boolean,
        required: true,
        default: false
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});


const RoadblockBanner = models?.RoadblockBanner || mongoose.model('RoadblockBanner', RoadblockBannerSchema);
export default RoadblockBanner;