const express = require('express');

const Yorum = require('../models/Yorum');
const { STATUS_APPROVED } = require('../models/Yorum');
const { presentUniversity } = require('../utils/universitePresenter');

const router = express.Router();

router.get('/son', async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 6, 20);
    const yorumlar = await Yorum.find({ durum: STATUS_APPROVED })
      .sort({ tarih: -1 })
      .limit(limit)
      .populate('universite')
      .lean();

    res.json(
      yorumlar.map((yorum) => ({
        id: String(yorum._id),
        kullanici: yorum.kullanici,
        yorum: yorum.yorum,
        puan: yorum.puan,
        tarih: yorum.tarih,
        universite: yorum.universite ? presentUniversity(yorum.universite) : null
      }))
    );
  } catch (error) {
    next(error);
  }
});

module.exports = router;
