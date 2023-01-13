import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import cors from "cors";
import joi from "joi";
import bcrypt from "bcrypt";
import { v4 as uuidV4 } from "uuid";

const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());

const PORT = 5000; //server PORT

const mongoClient = new MongoClient(process.env.DATABASE_URL);
let db;

let messages = [
  {
    from: "João",
    to: "Todos",
    text: "oi galera",
    type: "message",
    time: "20:04:37",
  },
];

try {
  await mongoClient.connect();
} catch (err) {
  console.log("Erro no mongo.conect", err.message);
}

db = mongoClient.db();
const collectionUsers = db.collection("participants");

app.post("/participants", (req, res) => {
  const { name } = req.body;

  const schema = joi.object({
    name: joi.string().min(1).required(),
  });
  const { error } = schema.validate({ name });
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  db.collection("participants")
    .insertOne({ name })
    .then(() => {
      return res.status(201).send("User registered!");
    })
    .catch(() => {
      res.status(422).send("Register error!");
    });
});

app.listen(PORT, () => console.log(`Server running in PORT: ${PORT}`));
