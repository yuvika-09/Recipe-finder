const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("./userModel");

const app = express();
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/authDB", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=>console.log("Auth DB connected"))
  .catch(err=>console.error(err));

app.post("/register", async (req, res) => {
    try {
        const existing = await User.findOne({ username: req.body.username });
        if (existing) return res.json({ message: "User already exists" });
        await User.create(req.body);
        res.json({ message: "User registered successfully" });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post("/login", async (req, res) => {
    try {
        const user = await User.findOne(req.body);
        if (!user) return res.json({ message: "Invalid credentials" });
        const token = jwt.sign({ id: user._id, username: user.username }, "SECRET123");
        res.json({ token });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(6000, () => console.log("Auth service running on http://localhost:6000"));
