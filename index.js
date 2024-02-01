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

const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  let token;
  if (!authorization) {
    res.status(401).send({ error: true, message: "Unauthorized Access !!" });
  }
  if (authorization) {
    token = authorization.split(" ")[1];
  }
  jwt.verify(token, secret, (error, decoded) => {
    if (error) {
      return res.status(401).send({ error: 1, message: "Unauthorized Access !!" });
    }
    req.decoded = decoded;
    next();
  })
}

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

    // JWT API
    app.get("/jwt/:email", (req, res) => {
      const email = req.params.email;
      const token = jwt.sign({ email }, secret, { expiresIn: '1h' });
      res.send({ token });
    })

    // Admin Verification
    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      if (user?.role !== "admin") {
        return res.status(403).send({ error: 1, message: "Forbidden Access !!" })
      }
      next();
    }

    // Menu APIs
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

    // Review APIs
    app.get("/reviews", async (req, res) => {
      const cursor = reviewCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    // Cart APIs
    app.post("/carts", async (req, res) => {
      const cart = req.body;
      const result = await cartCollection.insertOne(cart);
      res.send(result);
    })

    app.get("/carts", verifyJWT, async (req, res) => {
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

    // Admin API
    app.get("/users/admin/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      const result = user?.role === "admin";
      res.send(result);
    })

    // User APIs
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

    app.patch("/users/:id", verifyJWT, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const userRole = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = { $set: { role: userRole.role } };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    })

    app.get("/users", async (req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.findOne(query);
      res.send(result);
    })

    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
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
