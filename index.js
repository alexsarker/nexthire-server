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
    const applicationCollection = client.db("NexthireDB").collection("applications");

    app.get("/jobs", async (req, res) => {
      try {
        const result = await postCollection.find().toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: "Failed to fetch jobs" });
      }
    });

    app.get("/jobs/:category", async (req, res) => {
      const { category } = req.params;
      const jobs = await postCollection.find({ category }).toArray();
      res.send(jobs);
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

    app.get("/jobs/details/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const job = await postCollection.findOne({ _id: new ObjectId(id) });
        if (!job) return res.status(404).send({ error: "Job not found" });
        res.send(job);
      } catch (error) {
        res.status(500).send({ error: "Failed to fetch job details" });
      }
    });

    app.delete("/jobs/delete/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await postCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
          return res.status(404).send({ error: "Job not found or already deleted" });
        }

        res.send({ message: "Job post deleted successfully" });
      } catch (error) {
        res.status(500).send({ error: "Failed to delete job post" });
      }
    });

    app.post("/jobs/apply", async (req, res) => {
      try {
        const { jobId, userEmail } = req.body;
        const applicants = await applicationCollection.findOne({ jobId, userEmail });
        if (applicants) {
          return res.status(400).send({ error: "You have already applied for this job" });
        }

        const result = await applicationCollection.insertOne({ jobId, userEmail, appliedAt: new Date() });
        res.send({ success: true, message: "Application submitted successfully", result });
      } catch (error) {
        res.status(500).send({ error: "Failed to apply for job" });
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
