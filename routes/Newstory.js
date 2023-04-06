const express = require("express");
const router = express.Router();
const Newstory = require("../models/Newstory");

router.get("/", async (req, res) => {
  try {
    const Newstoryx = await Newstory.find({}, { main_carousels: 0 });
    res.json(Newstoryx);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const Newstoryx = await Newstory.findById(id);
    if (!Newstoryx) {
      return res.status(400).json({ error: "Newstory not found" });
    }
    res.json(Newstoryx);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  const { _id, main_title, main_img_url, main_carousels, date } = req.body;
  try {
    const Newstoryx = await Newstory.create({
      _id,
      main_title,
      main_img_url,

      main_carousels,
      date,
    });
    res.status(200).json(Newstoryx);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const Newstoryx = await Newstory.findByIdAndDelete(id);
    if (!Newstoryx) {
      return res.status(400).json({ error: "Newstory not found" });
    }
    res.json({ message: "Newstory deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const Newstoryx = await Newstory.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!Newstoryx) {
      return res.status(400).json({ error: "Newstory not found" });
    }
    res.json(Newstoryx);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
router.delete("/", async (req, res) => {
  try {
    const result = await Newstory.deleteMany();
    if (result.deletedCount === 0) {
      return res.status(400).json({ error: "No Newstorys found to delete" });
    }
    res.json({ message: "All Newstorys deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
