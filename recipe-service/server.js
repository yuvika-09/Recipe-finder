const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Recipe = require("./recipeModel");
const redis = require("redis");

const app = express();
app.use(express.json());


const cors = require("cors");
app.use(cors());


const MONGO = process.env.MONGO || "mongodb://127.0.0.1:27017/recipeDB";
const JWT_SECRET = process.env.JWT_SECRET || "SECRET123";
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Recipe DB connected"))
  .catch(err => console.error("Mongo connect error:", err.message));


let publisher = null;
(async () => {
  try {
    publisher = redis.createClient({ url: REDIS_URL });
    publisher.on("error", (e) => console.warn("Redis publisher error:", e.message));
    await publisher.connect();
    console.log("Redis publisher connected");
  } catch (e) {
    console.warn("Redis not available, continuing without pub/sub:", e.message);
    publisher = null;
  }
})();


async function safePublish(channel, payload) {
  if (!publisher || !publisher.isOpen) return;
  try {
    await publisher.publish(channel, JSON.stringify(payload));
  } catch (e) {
    console.warn("Failed publishing to redis:", e.message);
  }
}


function verify(req, res, next) {
  try {
    const auth = req.headers.authorization || req.headers.Authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : auth;
    if (!token) return res.status(401).json({ message: "Missing token" });
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid token", error: e.message });
  }
}

// ---------- ROUTES ----------


app.get("/recipes/search", verify, async (req, res) => {
    const query = req.query.q || "";

    try {
        const results = await Recipe.find({
            $or: [
                { name: { $regex: query, $options: "i" } },
                { ingredients: { $regex: query, $options: "i" } }
            ]
        }).lean();

        res.json(results);
    } catch (err) {
        res.status(500).json({ error: "Search failed", details: err.message });
    }
});

app.get("/recipes", verify, async (req, res) => {
    const list = await Recipe.find().sort({ _id: -1 }).lean();
    res.json(list);
});


app.get("/recipes/:id", async (req, res) => {
  try {
    const r = await Recipe.findById(req.params.id).lean();
    if (!r) return res.status(404).json({ message: "Not found" });
    res.json(r);
  } catch (e) {
    console.error("GET /recipes/:id error:", e);
    res.status(500).json({ message: "Server error", error: e.message });
  }
});


app.post("/recipes", verify, async (req, res) => {
  try {
    if (!req.body.name || !String(req.body.name).trim()) {
      return res.status(400).json({ message: "Recipe name is required" });
    }
    const payload = {
      name: String(req.body.name).trim(),
      ingredients: req.body.ingredients || "",
      instructions: req.body.instructions || "",
      image: req.body.image || ""
    };
    const recipe = await Recipe.create(payload);
    await safePublish("recipe-events", { type: "ADD", recipe });
    res.status(201).json({ message: "Recipe added", recipe });
  } catch (e) {
    console.error("POST /recipes error:", e);
    res.status(500).json({ message: "Server error", error: e.message });
  }
});


app.put("/recipes/:id", verify, async (req, res) => {
  try {
    const updates = {};
    if (req.body.name !== undefined) updates.name = String(req.body.name).trim();
    if (req.body.ingredients !== undefined) updates.ingredients = req.body.ingredients;
    if (req.body.instructions !== undefined) updates.instructions = req.body.instructions;
    if (req.body.image !== undefined) updates.image = req.body.image;
    updates.updatedAt = new Date();

    const recipe = await Recipe.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!recipe) return res.status(404).json({ message: "Not found" });
    await safePublish("recipe-events", { type: "UPDATE", recipe });
    res.json({ message: "Recipe updated", recipe });
  } catch (e) {
    console.error("PUT /recipes/:id error:", e);
    res.status(500).json({ message: "Server error", error: e.message });
  }
});


app.delete("/recipes/:id", verify, async (req, res) => {
  try {
    const deleted = await Recipe.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    await safePublish("recipe-events", { type: "DELETE", id: req.params.id });
    res.json({ message: "Recipe deleted" });
  } catch (e) {
    console.error("DELETE /recipes/:id error:", e);
    res.status(500).json({ message: "Server error", error: e.message });
  }
});



const PORT = process.env.PORT || 7000;
app.listen(PORT, () => console.log(`Recipe service running on http://localhost:${PORT}`));
