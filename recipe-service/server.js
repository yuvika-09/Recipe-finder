const express = require('express');
const mongoose = require('mongoose');
const recipeRoutes = require('./routes/recipeRoutes');

const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/recipeDB')
.then(() => console.log("Recipe DB Connected"))
.catch(err => console.log(err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/recipes', recipeRoutes);

app.listen(3002, () => {
    console.log("Recipe Service running on http://localhost:3002");
});
