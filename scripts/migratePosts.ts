// import { config } from 'dotenv';
// import mongoose, { AnyBulkWriteOperation } from 'mongoose';
// import Post from '@/model/post.model';

import Tag from "@/model/tags.model";
import mongoose from "mongoose";

// config();

// function extractPublicIdFromUrl(url: string | null): string {
//     if (!url) return '';
//     try {
//         const parts = url.split('/');
//         const last = parts[parts.length - 1];
//         return last.replace(/\.[^/.]+$/, '');
//     } catch {
//         return '';
//     }
// }

// async function fixSponsoredAds() {
//     try {
//         if (!process.env.MONGODB_URL) {
//             console.error('❌ MONGODB_URL is not set');
//             process.exit(1);
//         }

//         console.log('🔌 Connecting to MongoDB...');
//         await mongoose.connect("mongodb+srv://joshisagarm3:g4115fgNNxwiIpmC@biratinfo-main.4rguz6x.mongodb.net/?retryWrites=true&w=majority&appName=BiratInfo-Main", { dbName: 'Birat_Info' });
//         console.log('✅ Connected to MongoDB');

//         const posts = await Post.find({
//             'sponsoredAds.url': { $exists: false },
//             'sponsoredAds.public_id': { $type: 'string' }
//         });

//         console.log(`📊 Found ${posts.length} posts to fix`);

//         const bulkOps = posts.map(post => {
//             const imageUrl = post.sponsoredAds?.public_id
//                 ? `https://res.cloudinary.com/biratinfo/image/upload/${post.sponsoredAds.public_id}.jpg`
//                 : 'https://res.cloudinary.com/biratinfo/image/upload/v1751554796/advertisement_rnj6jy.jpg';

//             if (!imageUrl) return null;

//             const update = {
//                 sponsoredAds: {
//                     url: imageUrl,
//                     public_id: extractPublicIdFromUrl(imageUrl),
//                 }
//             };

//             return {
//                 updateOne: {
//                     filter: { _id: post._id },
//                     update: { $set: update }
//                 }
//             };
//         }).filter(Boolean) as AnyBulkWriteOperation<any>[];

//         if (bulkOps.length === 0) {
//             console.log('✅ Nothing to fix.');
//         } else {
//             const result = await Post.bulkWrite(bulkOps);
//             console.log(`✅ Fixed ${result.modifiedCount} sponsoredAds fields`);
//         }
//     } catch (err) {
//         console.error('❌ Migration failed:', err);
//     } finally {
//         await mongoose.disconnect();
//         console.log('🔌 Disconnected from MongoDB');
//     }
// }

// fixSponsoredAds();

// 3. Define the default tags
const defaultTags = [
    { en: 'Breaking News', np: 'ताजा खबर', count: 0 },
    { en: 'COVID-19', np: 'कोभिड-१९', count: 0 },
    { en: 'Election', np: 'निर्वाचन', count: 0 },
    { en: 'Visit Nepal 2025', np: 'भ्रमण वर्ष २०२५', count: 0 },
    { en: 'Budget 2025', np: 'बजेट २०२५', count: 0 },
    { en: 'Startup Ecosystem', np: 'स्टार्टअप वातावरण', count: 0 },
    { en: 'Weather Alert', np: 'मौसम जानकारी', count: 0 },
    { en: 'Earthquake', np: 'भूकम्प', count: 0 },
    { en: 'Kathmandu', np: 'काठमाडौं', count: 0 },
    { en: 'Loadshedding', np: 'लोडसेडिङ', count: 0 },
    { en: 'Floods', np: 'बाढी', count: 0 },
    { en: 'Gold Price', np: 'सुनको मूल्य', count: 0 },
    { en: 'Business', np: 'व्यापार', count: 0 },
    { en: 'Stock Market', np: 'सेयर बजार', count: 0 },
    { en: 'Nepal Cricket', np: 'नेपाल क्रिकेट', count: 0 },
    { en: 'Tech News', np: 'प्रविधि समाचार', count: 0 },
    { en: 'Ncell', np: 'एनसेल', count: 0 },
    { en: 'Movie', np: 'चलचित्र', count: 0 },
    { en: 'Festival', np: 'चाडपर्व', count: 0 },
    { en: 'Himalayas', np: 'हिमालय', count: 0 },
    { en: 'Traffic Update', np: 'यातायात जानकारी', count: 0 },
];

// 4. Main seeding function
async function seedTags() {
    try {
        await mongoose.connect('mongodb+srv://joshisagarm3:g4115fgNNxwiIpmC@biratinfo-main.4rguz6x.mongodb.net/?retryWrites=true&w=majority&appName=BiratInfo-Main', {
            dbName: "Birat_Info"
        }); // Replace with your actual URI
        console.log('✅ Connected to MongoDB');
        await Tag.deleteMany({});
        const res = await Tag.insertMany(defaultTags);
        console.log(res)
        console.log('✅ Default tags inserted');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error inserting tags:', error);
        process.exit(1);
    }
}

seedTags();

