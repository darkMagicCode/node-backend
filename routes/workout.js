const express = require("express");
const router = express.Router();
const Workout = require("../models/Workout");

router.get("/", async (req, res) => {
  try {
    const users = await Workout.find({}, { carousels: 0 });
    res.json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const workout = await Workout.findById(id);
    if (!workout) {
      return res.status(400).json({ error: "Workout not found" });
    }
    res.json(workout);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  const { _id, title, media, carousels, date } = req.body;
  try {
    const user = await Workout.create({
      _id,
      title,
      media,

      carousels,
      date,
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const workout = await Workout.findByIdAndDelete(id);
    if (!workout) {
      return res.status(400).json({ error: "Workout not found" });
    }
    res.json({ message: "Workout deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const workout = await Workout.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!workout) {
      return res.status(400).json({ error: "Workout not found" });
    }
    res.json(workout);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
router.delete("/", async (req, res) => {
  try {
    const result = await Workout.deleteMany();
    if (result.deletedCount === 0) {
      return res.status(400).json({ error: "No workouts found to delete" });
    }
    res.json({ message: "All workouts deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
