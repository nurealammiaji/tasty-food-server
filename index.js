require('dotenv').config();
const jwt = require('jsonwebtoken');
const cors = require('cors');
const express = require('express');
const app = express();

const port = process.env.PORT || 5000;
const user = process.env.DB_USER;
const pass = process.env.DB_PASS;
const secret = process.env.ACCESS_TOKEN_SECRET;

// Middlewares
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Tasty Food Server");
})

app.listen(port, () => {
    console.log(`Tasty Food Server is running on port: ${port}`);
})


// MongoDB Driver
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${user}:${pass}@cluster0.31s3qjy.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
