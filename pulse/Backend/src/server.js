import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import connectDB from './config/database.js';

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`PULSE server running on port ${PORT}`);
      console.log(`Environment: ${NODE_ENV}`);
    });
  } catch (error) {
    // Database connection failure is logged inside connectDB
    process.exit(1);
  }
};

startServer();
