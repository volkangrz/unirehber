const mongoose = require('mongoose');

const STATUS_PENDING = 'beklemede';
const STATUS_APPROVED = 'onayland\u0131';
const STATUS_REJECTED = 'reddedildi';

const YorumSchema = new mongoose.Schema(
  {
    universite: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Universite',
      required: true,
      index: true
    },
    kullanici: {
      type: String,
      trim: true,
      default: 'anonim',
      maxlength: 60
    },
    yorum: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1200
    },
    puan: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    durum: {
      type: String,
      enum: [STATUS_PENDING, STATUS_APPROVED, STATUS_REJECTED],
      default: STATUS_PENDING,
      index: true
    },
    tarih: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    collection: 'yorumlar',
    timestamps: true
  }
);

YorumSchema.index({ universite: 1, durum: 1, tarih: -1 });

module.exports = mongoose.model('Yorum', YorumSchema);
module.exports.STATUS_PENDING = STATUS_PENDING;
module.exports.STATUS_APPROVED = STATUS_APPROVED;
module.exports.STATUS_REJECTED = STATUS_REJECTED;
