const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const CounterStorySchema = new Schema({
  _id: { type: String },
  sequence_value: { type: Number, default: 0 },
});

const CounterStory = mongoose.model("counterStory", CounterStorySchema);

const StorySchema = new mongoose.Schema({
  _id: Number, // Define _id as a Number type
  main_title: {
    type: String,
  },

  main_img_url: {
    type: String,
  },
  main_carousels: {
    type: [
      {
        is_ad_slide: Number,
        story_speed_slide: Number,
        img_url_slide: String,
        slot_num_slide: String,
        content_slide: String,
      },
    ],
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

StorySchema.pre("save", async function (next) {
  const doc = this;
  const counter = await CounterStory.findByIdAndUpdate(
    { _id: "story_id" },
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  );
  doc._id = counter.sequence_value;
  next();
});

module.exports = mongoose.model("Newstory", StorySchema);
