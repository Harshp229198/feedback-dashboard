const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const Feedback = require("./models/Feedback");
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection URI - replace with your actual connection string
const mongoURI =
  "mongodb+srv://harshprajapati20042004:Qd30MgcH4a6e82zO@cluster0.kp9q85x.mongodb.net/";

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Start server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

app.post("/api/feedback", async (req, res) => {
  const { name, email, message, rating } = req.body;

  if (!name || !message) {
    return res.status(400).json({ error: "Name and message are required" });
  }

  try {
    const newFeedback = new Feedback({ name, email, message, rating });
    await newFeedback.save();
    res.status(201).json(newFeedback);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/feedback - get all feedbacks
app.get("/api/feedback", async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/stats - feedback analytics
app.get("/api/stats", async (req, res) => {
  try {
    const feedbacks = await Feedback.find();
    const total = feedbacks.length;
    const averageRating = total
      ? (
          feedbacks.reduce((acc, f) => acc + Number(f.rating), 0) / total
        ).toFixed(2)
      : 0;
    const positive = feedbacks.filter((f) => Number(f.rating) >= 4).length;
    const negative = total - positive;
    res.json({ total, averageRating, positive, negative });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});
