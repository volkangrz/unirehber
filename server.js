const path = require('path');
const express = require('express');
const session = require('express-session');
require('dotenv').config();

const connectDB = require('./config/db');
const universiteRoutes = require('./routes/universiteRoutes');
const yorumRoutes = require('./routes/yorumRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  app.set('trust proxy', 1);
}

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'unirehber-dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      maxAge: 1000 * 60 * 60 * 6
    }
  })
);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/universite/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'universite.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'unirehber',
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use('/api/universiteler', universiteRoutes);
app.use('/api/yorumlar', yorumRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Sayfa veya API bulunamadi.' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Sunucuda beklenmeyen bir hata olustu.'
  });
});

app.listen(PORT, () => {
  console.log(`UNIREHBER ${PORT} portunda calisiyor`);
});
