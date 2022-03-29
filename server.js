import express from "express";
// import mongoData from "./mongoData.js";
import mongoose from "mongoose";
import cors from "cors";
import Pusher from "pusher";
import dotenv from "dotenv";
import mongoData from "./mongoData.js";

// Pass eOFWdUH4bFv6ZVLg
// demoads
// mongodb+srv://demoads:eOFWdUH4bFv6ZVLg@cluster0.rhlh8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority

const app = express();
const port = process.env.PORT || 4000;
dotenv.config();

const pusher = new Pusher({
  appId: "1368828",
  key: "9d8cb3a0083167782a5a",
  secret: "147d05fd8165cf8eed9d",
  cluster: "ap2",
  useTLS: true,
});

// middleware
app.use(express.json());
app.use(cors());

const mongoURI = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.rhlh8.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once("open", () => {
  console.log("DB connected");

  const changeStream = mongoose.connection.collection("posts").watch();

  changeStream.on("change", (change) => {
    if (change.operationType === "insert") {
      pusher.trigger("posts", "newPost", {
        change: "change",
      });
    } else if (change.operationType === "update") {
      pusher.trigger("post", "updatePost", {
        change: change,
      });
    } else {
      console.log("Error Trigerring Pusher");
    }
  });
});

app.get("/", (req, res) => res.status(200).send("Hello world"));

app.post("/new/post", (req, res) => {
  const dbData = req.body;
  mongoData.create(dbData, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(data);
    }
  });
});

app.get("/get/posts", (req, res) => {
  const sort = { timestamp: -1 };
  mongoData
    .find((err, data) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).send(data);
      }
    })
    .sort(sort);
});

app.get("/get/myposts", (req, res) => {
  const id = req.query.id;
  const sort = { timestamp: -1 };

  mongoData
    .find({ userId: id }, (err, data) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).send(data);
      }
    })
    .sort(sort);
});

app.post("/update/posts", (req, res) => {
  mongoData.updateMany(
    { userId: req.query.id },
    { $set: { user: req.body } },
    (err, data) => {
      if (err) {
        console.log("Error saving message...", err);
        res.status(500).send(err);
      } else {
        res.status(201).send(data);
      }
    }
  );
});

app.listen(port, () => console.log(`Server running on port ${port}`));
