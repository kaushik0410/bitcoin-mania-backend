const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const miningRoutes = require('./routes/miningRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const cors = require('cors');

dotenv.config();
console.log('Loaded MONGO_URI:', process.env.MONGO_URI);

const app = express();

const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error(err));

app.use('/api/auth', authRoutes);
app.use('/api/mining', miningRoutes);
app.use('/api/payment', paymentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
