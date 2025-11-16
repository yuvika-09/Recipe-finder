const Recipe = require('../models/Recipe');

exports.getRecipes = async (req, res) => {
    const recipes = await Recipe.find({ userId: req.user.id });
    res.json(recipes);
};

exports.addRecipe = async (req, res) => {
    const { name, ingredients, instructions, image } = req.body;
    if (!name || !ingredients || !instructions) {
        return res.json({ 
            message: 'All fields required' 
        });
    }
    const recipe = new Recipe({ 
        userId: req.user.id, 
        name, 
        ingredients, 
        instructions, 
        image 
    });
    await recipe.save();
    res.json({ 
        message: 'Recipe added', recipe 
    });
};


exports.updateRecipe = async (req, res) => {
    const { id } = req.params;
    const recipe = await Recipe.findOneAndUpdate(
        { _id: id, userId: req.user.id },
        req.body,
        { new: true }
    );
    if (!recipe) 
        return res.json({ message: 'Recipe not found' });
    res.json({ message: 'Recipe updated', recipe });
};


exports.deleteRecipe = async (req, res) => {
    const { id } = req.params;
    const recipe = await Recipe.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!recipe) return res.json({ message: 'Recipe not found' });
    res.json({ message: 'Recipe deleted' });
};