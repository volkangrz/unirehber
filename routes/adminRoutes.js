const express = require('express');
const mongoose = require('mongoose');

const Yorum = require('../models/Yorum');
const {
  STATUS_PENDING,
  STATUS_APPROVED,
  STATUS_REJECTED
} = require('../models/Yorum');
const { presentUniversity } = require('../utils/universitePresenter');

const router = express.Router();

const allowedStatuses = [STATUS_PENDING, STATUS_APPROVED, STATUS_REJECTED];

const requireAdmin = (req, res, next) => {
  if (!req.session?.isAdmin) {
    return res.status(401).json({ message: 'Admin girisi gerekli.' });
  }

  next();
};

router.post('/login', (req, res) => {
  const password = String(req.body.password || '');
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (password !== adminPassword) {
    return res.status(401).json({ message: 'Sifre hatali.' });
  }

  req.session.isAdmin = true;
  res.json({ message: 'Giris basarili.' });
});

router.post('/logout', requireAdmin, (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Cikis yapildi.' });
  });
});

router.get('/me', (req, res) => {
  res.json({ isAdmin: Boolean(req.session?.isAdmin) });
});

router.get('/yorumlar', requireAdmin, async (req, res, next) => {
  try {
    const durum = req.query.durum || STATUS_PENDING;
    const filter = allowedStatuses.includes(durum) ? { durum } : {};

    const yorumlar = await Yorum.find(filter)
      .sort({ tarih: -1 })
      .limit(200)
      .populate('universite')
      .lean();

    res.json(
      yorumlar.map((yorum) => ({
        id: String(yorum._id),
        kullanici: yorum.kullanici,
        yorum: yorum.yorum,
        puan: yorum.puan,
        durum: yorum.durum,
        tarih: yorum.tarih,
        universite: yorum.universite ? presentUniversity(yorum.universite) : null
      }))
    );
  } catch (error) {
    next(error);
  }
});

router.patch('/yorumlar/:id', requireAdmin, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Gecersiz yorum id.' });
    }

    const durum = req.body.durum;

    if (!allowedStatuses.includes(durum)) {
      return res.status(400).json({ message: 'Gecersiz yorum durumu.' });
    }

    const yorum = await Yorum.findByIdAndUpdate(
      req.params.id,
      { durum },
      { new: true, runValidators: true }
    ).lean();

    if (!yorum) {
      return res.status(404).json({ message: 'Yorum bulunamadi.' });
    }

    res.json({ message: 'Yorum durumu guncellendi.', yorum });
  } catch (error) {
    next(error);
  }
});

router.delete('/yorumlar/:id', requireAdmin, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Gecersiz yorum id.' });
    }

    const yorum = await Yorum.findByIdAndDelete(req.params.id).lean();

    if (!yorum) {
      return res.status(404).json({ message: 'Yorum bulunamadi.' });
    }

    res.json({ message: 'Yorum silindi.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
