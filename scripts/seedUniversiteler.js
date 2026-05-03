const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const Universite = require('../models/Universite');

const mongoUri = process.env.MONGO_URI;
const dataPath = path.join(__dirname, '..', 'data', 'universiteler.json');

if (!mongoUri) {
  console.error('MONGO_URI gerekli. Ornek: MONGO_URI=mongodb+srv://... npm run seed:universiteler');
  process.exit(1);
}

const main = async () => {
  const raw = fs.readFileSync(dataPath, 'utf8');
  const docs = JSON.parse(raw);

  await mongoose.connect(mongoUri);

  const operations = docs.map((doc) => ({
    updateOne: {
      filter: { _id: doc._id },
      update: { $set: doc },
      upsert: true
    }
  }));

  const result = await Universite.bulkWrite(operations);
  console.log(`${docs.length} universite islendi.`);
  console.log(`Yeni: ${result.upsertedCount}, guncellenen: ${result.modifiedCount}`);

  await mongoose.disconnect();
};

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
