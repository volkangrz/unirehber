const mongoose = require('mongoose');

const legacyNameField = '\u00fcniversite_ad\u0131';
const compassNameField = '\u00fcniversite_adi';

const UniversiteSchema = new mongoose.Schema(
  {
    ad: {
      type: String,
      trim: true
    },
    universite_adi: {
      type: String,
      trim: true
    },
    [compassNameField]: {
      type: String,
      trim: true
    },
    [legacyNameField]: {
      type: String,
      trim: true
    },
    sehir: {
      type: String,
      trim: true,
      index: true
    },
    tur: {
      type: String,
      trim: true,
      index: true
    },
    web: {
      type: String,
      trim: true
    },
    puan: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    bolumler: [
      {
        type: String,
        trim: true
      }
    ]
  },
  {
    collection: 'universiteler',
    timestamps: true,
    strict: false
  }
);

UniversiteSchema.index({
  ad: 'text',
  universite_adi: 'text',
  sehir: 'text',
  tur: 'text'
});

module.exports = mongoose.model('Universite', UniversiteSchema);
module.exports.legacyNameField = legacyNameField;
module.exports.compassNameField = compassNameField;
