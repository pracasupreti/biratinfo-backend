/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Mongoose } from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL!;

interface MongooseConn {
    conn: Mongoose | null
    promise: Promise<Mongoose> | null;
}

let cached: MongooseConn = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = {
        conn: null,
        promise: null
    }
}


export const connect = async () => {
    if (cached.conn) return cached.conn;

    cached.promise = cached.promise || mongoose.connect(MONGODB_URL, {
        dbName: "Birat_Info",
        bufferCommands: false,
        connectTimeoutMS: 30000
    })

    cached.conn = await cached.promise
    console.log("DB CONNECTED SUCCESSFULLY")

    return cached.conn;
}