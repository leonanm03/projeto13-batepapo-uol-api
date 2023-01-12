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

try {
  await mongoClient.connect();
} catch (err) {
  console.log("Erro no mongo.conect", err.message);
}

app.get("/teste", (req, res) => {
  console.log("entrei no get");
  res.status(200).send("testando 123");
});

db = mongoClient.db();
const talCollection = db.collection("COLLECTIONNNNN");

app.listen(PORT, () => console.log(`Server running in PORT: ${PORT}`));
