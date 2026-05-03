const { compassNameField, legacyNameField } = require('../models/Universite');

const getUniversityName = (universite) => {
  if (!universite) return '';

  return (
    universite.ad ||
    universite.universite_adi ||
    universite[compassNameField] ||
    universite[legacyNameField] ||
    universite._doc?.ad ||
    universite._doc?.universite_adi ||
    universite._doc?.[compassNameField] ||
    universite._doc?.[legacyNameField] ||
    'Isimsiz universite'
  );
};

const presentUniversity = (universite, stats = {}) => {
  const item = typeof universite.toObject === 'function' ? universite.toObject() : universite;

  return {
    id: String(item._id),
    ad: getUniversityName(item),
    sehir: item.sehir || '',
    tur: item.tur || '',
    web: item.web || '',
    bolumler: item.bolumler || [],
    puan: Number(stats.ortalamaPuan ?? item.puan ?? 0),
    yorumSayisi: Number(stats.yorumSayisi ?? 0)
  };
};

const normalizeText = (value) => String(value || '').trim();

module.exports = {
  getUniversityName,
  normalizeText,
  presentUniversity
};
