const express = require("express");
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const cors = require("cors");
const bodyParser = require("body-parser");

const workoutRoute = require("./routes/workout");
const StoryRoute = require("./routes/Newstory");
const Ecomm = require("./routes/Ecomm");
const path = require("path");

const app = express();

require("dotenv").config();

app.use(bodyParser.json({ limit: "50mb" }));
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(cors());
app.use("/gellAllItems", workoutRoute);
app.use("/getAllStories", StoryRoute);
app.use("/getAllprod", Ecomm);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Listening on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
const crypto = require("crypto");

const jwtRefreshSecret = crypto.randomBytes(64).toString("hex");
console.log(jwtRefreshSecret);
