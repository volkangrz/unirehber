const mongoose = require('mongoose');

const connectDB = async () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const mongoUri = process.env.MONGO_URI || (!isProduction ? 'mongodb://127.0.0.1:27017/universite_yorum' : '');

  if (!mongoUri) {
    console.error('Production ortaminda MONGO_URI zorunludur.');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000
    });
    console.log('MongoDB baglantisi kuruldu');
  } catch (error) {
    console.error('MongoDB baglanti hatasi:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
