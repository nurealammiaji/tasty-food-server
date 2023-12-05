require('dotenv').config();
const jwt = require('jsonwebtoken');
const cors = require('cors');
const express = require('express');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.send("Tasty Food Server");
})

app.listen(port, () => {
    console.log(`Tasty Food Server is running on port: ${port}`);
})