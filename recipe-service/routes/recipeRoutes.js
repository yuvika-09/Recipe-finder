const express = require('express');
const router = express.Router();

const auth = require('../middleware/authMiddleware');  // Token check
const {
    getRecipes,
    addRecipe,
    updateRecipe,
    deleteRecipe
} = require('../controllers/recipeController'); // <-- fixed path

// ADD a recipe
router.post('/add', auth, addRecipe);

// GET all recipes for logged-in user
router.get('/all', auth, getRecipes);

// UPDATE recipe
router.put('/update/:id', auth, updateRecipe);

// DELETE recipe
router.delete('/delete/:id', auth, deleteRecipe);

module.exports = router;
