import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import cors from "cors";
import joi from "joi";
import dayjs from "dayjs";

const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());

const PORT = 5000; //server PORT

// Database connection
const mongoClient = new MongoClient(process.env.DATABASE_URL);
try {
  await mongoClient.connect();
} catch (err) {
  console.log("Erro no mongo.conect", err.message);
}

// Database collections
const db = mongoClient.db();
const collectionUsers = db.collection("participants");
const collectionMsgs = db.collection("messages");

// Register user
app.post("/participants", async (req, res) => {
  const { name } = req.body;

  //name validation
  const schema = joi.object({
    name: joi.string().min(1).required(),
  });
  const { error } = schema.validate({ name });
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const existingUser = await collectionUsers.findOne({ name: name });
  if (existingUser) {
    return res.status(409).send("This username already exists!");
  }

  //timestamp
  const time = Date.now();
  const timestamp = dayjs(time).format("HH:mm:ss");

  //insert user and status message in database
  try {
    await collectionUsers.insertOne({ name, lastStatus: time });
    await collectionMsgs.insertOne({
      from: name,
      to: "Todos",
      text: "entra na sala...",
      type: "status",
      time: timestamp,
    });

    return res.status(201).send("User registered!");
  } catch {
    return res.status(422).send("Register error!");
  }
});

// Get all users
app.get("/participants", async (req, res) => {
  const users = await collectionUsers.find().toArray();
  return res.status(200).send(users);
});

// Send message
app.post("/messages", async (req, res) => {
  const { to, text, type } = req.body;
  const from = req.headers.user;

  const userExists = await collectionUsers.findOne({ name: from });
  if (!userExists) {
    return res.status(404).send("User not found!");
  }

  //to, text, type validation
  const schema = joi.object({
    to: joi.string().min(1).required(),
    text: joi.string().min(1).required(),
    type: joi.string().valid("message", "private_message").required(),
  });
  const { error } = schema.validate({ to, text, type });
  if (error) {
    return res.status(422).send(error.details[0].message);
  }

  //timestamp
  const timestamp = dayjs(Date.now()).format("HH:mm:ss");
  //insert message in database
  try {
    await collectionMsgs.insertOne({
      from,
      to,
      text,
      type,
      time: timestamp,
    });
    return res.status(201).send("Message sent!");
  } catch {
    return res.status(422).send("Error sending message!");
  }
});

// Get messages
app.get("/messages", async (req, res) => {
  try {
    const messages = await collectionMsgs.find().toArray();
    return res.status(200).send(messages);
  } catch {
    return res.status(422).send("Error getting messages!");
  }
});

// start server
app.listen(PORT, () => console.log(`Server running in PORT: ${PORT}`));
