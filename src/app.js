import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import cors from "cors";
import joi from "joi";
import bcrypt from "bcrypt";
import { v4 as uuidV4 } from "uuid";
import dayjs from "dayjs";

const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());

const PORT = 5000; //server PORT

const mongoClient = new MongoClient(process.env.DATABASE_URL);
try {
  await mongoClient.connect();
} catch (err) {
  console.log("Erro no mongo.conect", err.message);
}

const db = mongoClient.db();
const collectionUsers = db.collection("participants");
const collectionMsgs = db.collection("messages");

let messages = [
  {
    from: "João",
    to: "Todos",
    text: "oi galera",
    type: "message",
    time: "20:04:37",
  },
];

// Register user
app.post("/participants", async (req, res) => {
  const { name } = req.body;

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

  const time = Date.now();
  let timestamp = dayjs(time).format("HH:mm:ss");

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

// start server
app.listen(PORT, () => console.log(`Server running in PORT: ${PORT}`));
