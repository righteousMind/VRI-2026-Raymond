import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI?.replace('<db_password>', process.env.MONGODB_PASSWORD ?? '');
  if (!uri) throw new Error('MONGODB_URI is not set');
  await mongoose.connect(uri);
  console.log('MongoDB connected');
}
