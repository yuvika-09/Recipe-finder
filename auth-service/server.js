const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');

const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/authDB')
.then(() => console.log("Auth DB Connected"))
.catch(err => console.log(err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', authRoutes);

app.listen(3001, () => {
    console.log("Auth Service running on http://localhost:3001");
});
