require('dotenv').config();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

// Server URL
app.get("/", (req, res) => {
  res.send("Tasty Food Server");
})

app.listen(port, () => {
  console.log(`Tasty Food Server is running on port: ${port}`);
})


// MongoDB Driver
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
    await client.connect();

    const menuCollection = client.db("tastyFood").collection("menus");
    const reviewCollection = client.db("tastyFood").collection("reviews");
    const cartCollection = client.db("tastyFood").collection("carts");
    const userCollection = client.db("tastyFood").collection("users");

    app.get("/menus", async (req, res) => {
      const cursor = menuCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get("/menus/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await menuCollection.findOne(query);
      res.send(result);
    })

    app.delete("/menus/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await menuCollection.deleteOne(query);
      res.send(result);
    })

    app.get("/reviews", async (req, res) => {
      const cursor = reviewCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.post("/carts", async (req, res) => {
      const cart = req.body;
      const result = await cartCollection.insertOne(cart);
      res.send(result);
    })

    app.get("/carts", async (req, res) => {
      const email = req.query.email;
      let query;
      if (email) {
        query = { email: email };
      }
      const cursor = cartCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get("/carts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await cartCollection.findOne(query);
      res.send(result);
    })

    app.delete("/carts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    })

    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "User already exists." });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    })

    app.get("/users", async (req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
