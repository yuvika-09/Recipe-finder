const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Recipe = require("./recipeModel");
const redis = require("redis");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());


const MONGO = "mongodb://127.0.0.1:27017/recipeDB";
const JWT_SECRET = "SECRET123";


mongoose.connect(MONGO)
  .then(() => console.log("Mongo connected"))
  .catch(err => console.log("Mongo error:", err.message));


const publisher = redis.createClient();
publisher.connect()
.then(() => console.log("Redis connected"));

async function publishEvent(type, data) {
  await publisher.publish("recipe-events", JSON.stringify({ type, data }));
}


function verify(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : auth;
  if (!token) return res.json({ message: "Missing token" });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } 
  catch {
    res.json({ message: "Invalid token" });
  }
}


app.get("/recipes/search", verify, async (req, res) => {
  const q = req.query.q || "";
  const results = await Recipe.find({
    $or: [
      { name: { $regex: q, $options: "i" } },
      { ingredients: { $regex: q, $options: "i" } }
    ]
  });

  res.json(results);
});


app.get("/recipes", verify, async (req, res) => {
  const list = await Recipe.find().sort({ _id: -1 });
  res.json(list);
});


app.get("/recipes/:id", async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) 
    return res.json({ message: "Not found" });
  res.json(recipe);
});


app.post("/recipes", verify, async (req, res) => {
  if (!req.body.name) 
    return res.json({ message: "Name required" });
  const recipe = await Recipe.create(req.body);
  await publishEvent("ADD", recipe);
  res.json({ message: "Recipe added", recipe });
});


app.put("/recipes/:id", verify, async (req, res) => {
  const recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!recipe) 
    return res.json({ message: "Not found" });
  await publishEvent("UPDATE", recipe);
  res.json({ message: "Updated", recipe });
});


app.delete("/recipes/:id", verify, async (req, res) => {
  const deleted = await Recipe.findByIdAndDelete(req.params.id);
  if (!deleted) 
    return res.json({ message: "Not found" });
  await publishEvent("DELETE", req.params.id);
  res.json({ message: "Deleted" });
});


app.listen(7000, () => {
  console.log("Server running on http://localhost:7000")
});