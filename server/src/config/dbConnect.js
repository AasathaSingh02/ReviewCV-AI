import mongoose from "mongoose";

export const dbConnect = async () => {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
        console.warn('[DATABASE] ⚠️ MONGO_URI is not set in server/.env');
        return;
    }

    console.log('[DATABASE] Connecting to MongoDB...');

    try {
        const connectionInstance = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        console.log(`[DATABASE] ✅ MongoDB connected successfully || Host: ${connectionInstance.connection.host}`);
        setupConnectionListeners();
        return connectionInstance;

    } catch (error) {
        console.warn(`[DATABASE] ⚠️ MongoDB connection attempt failed: ${error.message}`);
        console.log('[DATABASE] 💡 To connect, get a free MongoDB database at: https://www.mongodb.com/cloud/atlas');
        console.log('[DATABASE]    and set MONGO_URI in server/.env');
        throw error;
    }
};

function setupConnectionListeners() {
    mongoose.connection.on('error', (err) => {
        console.error('[DATABASE] MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
        console.warn('[DATABASE] MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
        console.log('[DATABASE] MongoDB reconnected');
    });
}