const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Forward Auth Requests
app.post("/api/auth/register", async (req, res) => {
    const result = await fetch("http://localhost:4000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body)
    });
    res.json(await result.json());
});

// Forward Recipe Requests
app.get("/api/recipes", async (req, res) => {
    const data = await fetch("http://localhost:5000/recipes");
    res.json(await data.json());
});

app.listen(3000, () => console.log("API Gateway running on 3000"));
