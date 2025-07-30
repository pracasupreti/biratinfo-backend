import { connect } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { getDBId } from "./user.action";
import RoadblockBanner from "@/model/roadblock.model";

export async function getAllRoadblocks() {
    try {
        await connect();

        // Fetch networks
        const roadblocks = await RoadblockBanner.find({}).sort({ createdAt: -1 });

        return {
            success: true,
            data: roadblocks,
            message: 'RoadBlocks fetched successfully'
        };

    } catch (error: any) {
        console.error('Error getting all roadblocks:', error);
        return {
            success: false,
            message: error.message || 'Failed to fetch roadblocks',
            error: error
        };
    }
}

export async function createRoadBlock(roadblockData: any) {
    try {
        await connect();
        const { userId } = await auth();
        if (!userId) throw new Error('Unauthorized');

        const db_id = await getDBId();
        if (!db_id) throw new Error('Error getting DB ID');


        await RoadblockBanner.create(roadblockData);

        return {
            success: true,
            message: 'Roadblock created successfully'
        };

    } catch (error: any) {
        console.error('Error creating roadblock:', error);
        return {
            success: false,
            message: error.message || 'Failed to create roadblock',
            error: error
        };
    }
}

export async function getRoadblockById(roadblockId: string) {
    try {
        await connect();
        const roadblock = await RoadblockBanner.findById(roadblockId);

        if (!roadblock) {
            return { success: false, message: 'Roadblock not found' };
        }


        return { success: true, roadblock };
    } catch (error) {
        console.error('Error getting roadblock by ID:', error);
        return { success: false, message: 'Failed to fetch roadblock' };
    }
}


export async function updateRoadblock(id: string, data: any) {
    try {
        await connect();
        const existingRoadblock = await RoadblockBanner.findOne({ _id: id })
        if (!existingRoadblock) {
            return { success: false, message: 'Roadblock not found' }
        }

        await RoadblockBanner.findOneAndUpdate(
            { _id: id },
            data,
            { new: true, lean: true }
        );

        return {
            success: true,
            message: 'Roadblock updated successfully'
        };

    } catch (error: any) {
        console.error('Error updating roadblock:', error);
        return {
            success: false,
            message: error.message || 'Failed to update roadblock',
            error: error
        };
    }
}

export async function deleteRoadBlock(id: string) {
    try {
        await connect();
        const existingRoadblock = await RoadblockBanner.findOne({ _id: id })
        if (!existingRoadblock) {
            return { success: false, message: 'Roadblock not found' }
        }

        await RoadblockBanner.findOneAndDelete(
            { _id: id },

        );

        return {
            success: true,
            message: 'Roadblock deleted successfully'
        };

    } catch (error: any) {
        console.error('Error deleting roadblock:', error);
        return {
            success: false,
            message: error.message || 'Failed to delete roadblock',
            error: error
        };
    }
}



export async function getRoadblock(network: string) {
    try {
        await connect();

        // Fetch roadblocks filtered by network
        const roadblocks = await RoadblockBanner.find({
            $or: [
                { networks: 'all' }, // Include banners for all networks
                { networks: { $in: [network] } } // Include banners specific to this network
            ]
        }).sort({ createdAt: -1 });

        return {
            success: true,
            data: roadblocks,
            message: 'RoadBlocks fetched successfully'
        };

    } catch (error: any) {
        console.error('Error getting all roadblocks:', error);
        return {
            success: false,
            message: error.message || 'Failed to fetch roadblocks',
            error: error
        };
    }
}