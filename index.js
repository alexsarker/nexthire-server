const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@clusterbase.o3yqpur.mongodb.net/?retryWrites=true&w=majority&appName=Clusterbase`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const postCollection = client.db("NexthireDB").collection("postjobs");

    app.get("/jobs", async (req, res) => {
      try {
        const result = await postCollection.find().toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: "Failed to fetch jobs" });
      }
    });

    app.post("/jobs", async (req, res) => {
      try {
        const jobData = req.body;
        const result = await postCollection.insertOne(jobData);
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: "Failed to post job" });
      }
    });

    app.get("/jobs/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const job = await postCollection.findOne({ _id: new ObjectId(id) });
        if (!job) return res.status(404).send({ error: "Job not found" });
        res.send(job);
      } catch (error) {
        res.status(500).send({ error: "Failed to fetch job" });
      }
    });

    console.log("Connected to MongoDB!");
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Boss is here!");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
