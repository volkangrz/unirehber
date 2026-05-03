const express = require('express');
const mongoose = require('mongoose');

const Universite = require('../models/Universite');
const Yorum = require('../models/Yorum');
const { STATUS_APPROVED } = require('../models/Yorum');
const { compassNameField, legacyNameField } = require('../models/Universite');
const { presentUniversity, normalizeText } = require('../utils/universitePresenter');

const router = express.Router();

const buildUniversityFilter = (query) => {
  const filter = {};
  const search = normalizeText(query.q);
  const sehir = normalizeText(query.sehir);
  const tur = normalizeText(query.tur);

  if (search) {
    const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [
      { ad: regex },
      { universite_adi: regex },
      { [compassNameField]: regex },
      { [legacyNameField]: regex },
      { sehir: regex }
    ];
  }

  if (sehir) {
    filter.sehir = new RegExp(`^${sehir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
  }

  if (tur) {
    filter.tur = new RegExp(`^${tur.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
  }

  return filter;
};

const getApprovedStats = async (universityIds) => {
  if (!universityIds.length) return new Map();

  const rows = await Yorum.aggregate([
    {
      $match: {
        universite: { $in: universityIds },
        durum: STATUS_APPROVED
      }
    },
    {
      $group: {
        _id: '$universite',
        yorumSayisi: { $sum: 1 },
        ortalamaPuan: { $avg: '$puan' }
      }
    }
  ]);

  return new Map(
    rows.map((row) => [
      String(row._id),
      {
        yorumSayisi: row.yorumSayisi,
        ortalamaPuan: Number(row.ortalamaPuan || 0).toFixed(1)
      }
    ])
  );
};

router.get('/', async (req, res, next) => {
  try {
    const filter = buildUniversityFilter(req.query);
    const sort = req.query.sort || 'ad';
    const limit = Math.min(Number(req.query.limit) || 205, 500);

    let universities = await Universite.find(filter).limit(limit).lean();
    const stats = await getApprovedStats(universities.map((item) => item._id));

    let payload = universities.map((item) => presentUniversity(item, stats.get(String(item._id))));

    if (sort === 'puan') {
      payload = payload.sort((a, b) => b.puan - a.puan || b.yorumSayisi - a.yorumSayisi);
    } else if (sort === 'yorum') {
      payload = payload.sort((a, b) => b.yorumSayisi - a.yorumSayisi || b.puan - a.puan);
    } else {
      payload = payload.sort((a, b) => a.ad.localeCompare(b.ad, 'tr'));
    }

    res.json(payload);
  } catch (error) {
    next(error);
  }
});

router.get('/filtreler', async (req, res, next) => {
  try {
    const [sehirler, turler] = await Promise.all([
      Universite.distinct('sehir'),
      Universite.distinct('tur')
    ]);

    res.json({
      sehirler: sehirler.filter(Boolean).sort((a, b) => a.localeCompare(b, 'tr')),
      turler: turler.filter(Boolean).sort((a, b) => a.localeCompare(b, 'tr'))
    });
  } catch (error) {
    next(error);
  }
});

router.get('/populer', async (req, res, next) => {
  try {
    const universities = await Universite.find({}).limit(205).lean();
    const stats = await getApprovedStats(universities.map((item) => item._id));

    const payload = universities
      .map((item) => presentUniversity(item, stats.get(String(item._id))))
      .sort((a, b) => b.yorumSayisi - a.yorumSayisi || b.puan - a.puan || a.ad.localeCompare(b.ad, 'tr'))
      .slice(0, 6);

    res.json(payload);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Gecersiz universite id.' });
    }

    const universite = await Universite.findById(req.params.id).lean();

    if (!universite) {
      return res.status(404).json({ message: 'Universite bulunamadi.' });
    }

    const yorumlar = await Yorum.find({
      universite: universite._id,
      durum: STATUS_APPROVED
    })
      .sort({ tarih: -1 })
      .lean();

    const stats = await getApprovedStats([universite._id]);

    res.json({
      universite: presentUniversity(universite, stats.get(String(universite._id))),
      yorumlar
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/yorumlar', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Gecersiz universite id.' });
    }

    const universite = await Universite.findById(req.params.id).select('_id').lean();

    if (!universite) {
      return res.status(404).json({ message: 'Universite bulunamadi.' });
    }

    const kullanici = normalizeText(req.body.kullanici) || 'anonim';
    const yorum = normalizeText(req.body.yorum);
    const puan = Number(req.body.puan);

    if (!yorum || yorum.length < 10) {
      return res.status(400).json({ message: 'Yorum en az 10 karakter olmali.' });
    }

    if (!Number.isInteger(puan) || puan < 1 || puan > 5) {
      return res.status(400).json({ message: 'Puan 1 ile 5 arasinda olmali.' });
    }

    await Yorum.create({
      universite: universite._id,
      kullanici,
      yorum,
      puan
    });

    res.status(201).json({
      message: 'Yorumun alindi. Admin onayindan sonra yayina girecek.'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
