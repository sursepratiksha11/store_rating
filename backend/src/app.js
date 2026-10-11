require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/stores', require('./routes/stores'));
app.use('/api/owner', require('./routes/owner'));

app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

// central error handler
app.use((err, _req, res, _next) => {
  if (err.code === '23505') return res.status(409).json({ message: 'That email is already registered' });
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on our side' });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log('API running on http://localhost:' + port));
