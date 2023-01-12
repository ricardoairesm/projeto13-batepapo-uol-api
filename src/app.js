import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";
import dotenv from "dotenv"
import Joi from "joi";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
const PORT = 5000;


// conectando ao banco
const mongoClient = new MongoClient(process.env.DATABASE_URL);
let db;

await mongoClient.connect()


app.get("/participants", (req, res) => {
    // buscando usuários

});

app.post("/participants", (req, res) => {
    // inserindo usuário
});

app.get("/messages", (req, res) => {
    // buscando mensagens

});

app.post("/messages", (req, res) => {
    // inserindo mensagens
});

app.post("/status", (req,res)=>{

});

app.listen(PORT,()=>{
    console.log(`Server running on ${PORT}...`)
});