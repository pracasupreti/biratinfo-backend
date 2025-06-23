import { connect } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { getDBId } from "./user.action";
import User from "@/model/user.model";
import Network from "@/model/network.model";

export async function getAllNetworks() {
    try {
        await connect();

        // Fetch networks
        const networks = await Network.find({}).sort({ createdAt: -1 });

        return {
            success: true,
            data: networks,
            message: 'Networks fetched successfully'
        };

    } catch (error: any) {
        console.error('Error getting all networks:', error);
        return {
            success: false,
            message: error.message || 'Failed to fetch networks',
            error: error
        };
    }
}

export async function createNetwork(networkData: any) {
    try {
        await connect();
        const { userId } = await auth();
        if (!userId) throw new Error('Unauthorized');

        const db_id = await getDBId();
        if (!db_id) throw new Error('Error getting DB ID');

        const { domainName } = networkData

        const existingNetwork = await Network.findOne({ domainName })
        if (existingNetwork) {
            return { success: false, message: 'Network already exists' }
        }


        await Network.create(networkData);

        return {
            success: true,
            message: 'Network created successfully'
        };

    } catch (error: any) {
        console.error('Error creating network:', error);
        return {
            success: false,
            message: error.message || 'Failed to create network',
            error: error
        };
    }
}

export async function getNetworkById(networkId: string) {
    try {
        await connect();
        const network = await Network.findById(networkId);

        if (!network) {
            return { success: false, message: 'Post not found' };
        }


        return { success: true, network };
    } catch (error) {
        console.error('Error getting post by ID:', error);
        return { success: false, message: 'Failed to fetch post' };
    }
}


export async function updateNetwork(id: string, data: any) {
    try {
        await connect();
        const existingNetwork = await Network.findOne({ _id: id })
        if (!existingNetwork) {
            return { success: false, message: 'Network not found' }
        }

        await Network.findOneAndUpdate(
            { _id: id },
            data,
            { new: true, lean: true }
        );

        return {
            success: true,
            message: 'Network updated successfully'
        };

    } catch (error: any) {
        console.error('Error creating network:', error);
        return {
            success: false,
            message: error.message || 'Failed to create network',
            error: error
        };
    }
}