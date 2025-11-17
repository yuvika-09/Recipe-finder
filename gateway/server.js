const express = require("express");
const fetch = require("node-fetch");
const path = require("path");
const app = express();
app.use(express.json());

const AUTH_URL = "http://localhost:6000";
const RECIPE_URL = "http://localhost:7000";

// Ensure "Bearer" format
function fixToken(req) {
    const raw = req.headers.authorization || "";
    if (!raw) return "";
    if (raw.startsWith("Bearer ")) return raw;
    return "Bearer " + raw;  // auto-fix token
}

// AUTH ROUTES
app.post("/api/auth/register", (req, res) => {
    fetch(`${AUTH_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body)
    })
    .then(r => r.json())
    .then(d => res.json(d))
    .catch(e => res.status(500).json({ error: e.message }));
});

app.post("/api/auth/login", (req, res) => {
    fetch(`${AUTH_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body)
    })
    .then(r => r.json())
    .then(d => res.json(d))
    .catch(e => res.status(500).json({ error: e.message }));
});

// RECIPE ROUTES

// SEARCH
app.get("/api/recipes/search", (req, res) => {
    const q = req.query.q || "";
    fetch(`${RECIPE_URL}/recipes/search?q=${q}`, {
        headers: { "Authorization": fixToken(req) }
    })
    .then(r => r.json())
    .then(d => res.json(d))
    .catch(e => res.status(500).json({ error: e.message }));
});

// LIST ALL
app.get("/api/recipes", (req, res) => {
    fetch(`${RECIPE_URL}/recipes`, {
        headers: { "Authorization": fixToken(req) }
    })
    .then(r => r.json())
    .then(d => res.json(d))
    .catch(e => res.status(500).json({ error: e.message }));
});

// ADD
app.post("/api/recipes", (req, res) => {
    fetch(`${RECIPE_URL}/recipes`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": fixToken(req)
        },
        body: JSON.stringify(req.body)
    })
    .then(r => r.json())
    .then(d => res.json(d))
    .catch(e => res.status(500).json({ error: e.message }));
});

// UPDATE
app.put("/api/recipes/:id", (req, res) => {
    fetch(`${RECIPE_URL}/recipes/${req.params.id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": fixToken(req)
        },
        body: JSON.stringify(req.body)
    })
    .then(r => r.json())
    .then(d => res.json(d))
    .catch(e => res.status(500).json({ error: e.message }));
});

// DELETE
app.delete("/api/recipes/:id", (req, res) => {
    fetch(`${RECIPE_URL}/recipes/${req.params.id}`, {
        method: "DELETE",
        headers: { "Authorization": fixToken(req) }
    })
    .then(r => r.json())
    .then(d => res.json(d))
    .catch(e => res.status(500).json({ error: e.message }));
});

// frontend
app.use("/", express.static(path.join(__dirname, "..", "public")));

app.listen(5000, () => console.log("API Gateway running on http://localhost:5000"));
