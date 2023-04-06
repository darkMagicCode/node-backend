const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const CounterSchema = new Schema({
  _id: { type: String },
  sequence_value: { type: Number, default: 0 },
});

const Counter = mongoose.model("counter", CounterSchema);

const UserSchema = new mongoose.Schema({
  _id: Number, // Define _id as a Number type
  title: {
    type: String,
  },

  main_img: {
    type: String,
  },
  carousels: {
    type: [
      {
        is_ad: Number,
        slot_num: String,
        img: String,
        content: String,
      },
    ],
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.pre("save", async function (next) {
  const doc = this;
  const counter = await Counter.findByIdAndUpdate(
    { _id: "user_id" },
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  );
  doc._id = counter.sequence_value;
  next();
});

module.exports = mongoose.model("Workout", UserSchema);

// const { Schema, model } = require('mongoose')

// const Place = model('Place', {
//   name: {
//     type: String,
//     required: true,
//   },
//   location: {
//     lat: Number,
//     lng: Number,
//   },
//   userId: {
//     type: Schema.Types.ObjectId,
//     ref: 'User',
//   },
//   cityId: {
//     type: Schema.Types.ObjectId,
//     ref: 'City',
//   },
// })

// module.exports = Place
// const { model } = require('mongoose')

// const City = model('City', {
//   name: {
//     type: String,
//     required: true,
//   },
//   description: {
//     type: String,
//     required: true,
//   },
// })

// module.exports = City
