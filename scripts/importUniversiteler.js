const path = require('path');
const mongoose = require('mongoose');
const readXlsxFile = require('read-excel-file/node');
require('dotenv').config();

const Universite = require('../models/Universite');

const legacyNameField = '\u00fcniversite_ad\u0131';
const compassNameField = '\u00fcniversite_adi';

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/universite_yorum';
const excelPath = process.argv[2];

if (!excelPath) {
  console.error('Kullanim: npm run import:excel -- ./universiteler.xlsx');
  process.exit(1);
}

const pick = (row, fields) => {
  for (const field of fields) {
    if (row[field] !== undefined && row[field] !== null && String(row[field]).trim()) {
      return String(row[field]).trim();
    }
  }

  return '';
};

const readRows = async (filePath) => {
  const table = await readXlsxFile(path.resolve(filePath));
  const headers = table[0]?.map((cell) => String(cell || '').trim()) || [];

  return table.slice(1).map((row) =>
    row.reduce((item, cell, index) => {
      const key = headers[index];
      if (key) item[key] = cell;
      return item;
    }, {})
  );
};

const main = async () => {
  await mongoose.connect(mongoUri);

  const rows = await readRows(excelPath);

  const docs = rows
    .map((row) => ({
      ad: pick(row, ['ad', 'Ad', 'Universite', 'Universite Adi', 'universite_adi', compassNameField, legacyNameField]),
      sehir: pick(row, ['sehir', 'Sehir', 'il', 'Il']),
      tur: pick(row, ['tur', 'Tur', 'Tip', 'type']),
      web: pick(row, ['web', 'Web', 'website', 'Website'])
    }))
    .filter((row) => row.ad);

  if (!docs.length) {
    console.log('Aktarilacak universite bulunamadi.');
    await mongoose.disconnect();
    return;
  }

  const operations = docs.map((doc) => ({
    updateOne: {
      filter: {
        $or: [{ ad: doc.ad }, { universite_adi: doc.ad }, { [compassNameField]: doc.ad }, { [legacyNameField]: doc.ad }]
      },
      update: { $set: doc },
      upsert: true
    }
  }));

  const result = await Universite.bulkWrite(operations);
  console.log(`${docs.length} satir islendi.`);
  console.log(`Yeni: ${result.upsertedCount}, guncellenen: ${result.modifiedCount}`);

  await mongoose.disconnect();
};

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
