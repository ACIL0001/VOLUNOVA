import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/volunova';

let isConnected = false;

export async function connectDB(): Promise<typeof mongoose> {
  if (isConnected) {
    return mongoose;
  }

  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true,
    });
    isConnected = true;
    console.log(`[MongoDB] Connected to database: ${conn.connection.name}`);
    return conn;
  } catch (error: any) {
    console.warn(`[MongoDB Warning] Could not connect to live database (${error.message}). Running in mock/memory-ready mode.`);
    return mongoose;
  }
}
