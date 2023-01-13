import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";
import dotenv from "dotenv"
import Joi from "joi";
import dayjs from "dayjs"
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
const PORT = 5000;


const validData = (schema, data) => !schema.validate(data).error;

const messageSchema = Joi.object({
    type: Joi.string().valid('message', 'private_message').required(),
    to: Joi.string().required(),
    text: Joi.string().required(),
});

const nameSchema = Joi.object({
    name: Joi.string().required().invalid('Todos'),
})

const headerSchema = Joi.string().required();


// conectando ao banco
const mongoClient = new MongoClient(process.env.DATABASE_URL);
let db;

await mongoClient.connect();
db = mongoClient.db();


app.get("/participants", async (req, res) => {
    // buscando usuários
    try {
        const userList = await db.collection("participants").find({}).toArray();
        return res.send(userList);
    } catch (error) {
        console.error("erro na rota get /participants", error);
        return res.sendStatus(500);
    }
});

app.post("/participants", async (req, res) => {
    // inserindo usuário
    const { name } = req.body;
    //validando usuario
    if (!validData(nameSchema, req.body)) {
        console.log("Insira um nome válido")
        return res.sendStatus(422);
    }
    //checando se o nome de usuario já existe
    const user = await db.collection("participants").findOne(req.body);
    if (user) {
        return res.sendStatus(409);
    };

    const now = dayjs();
    //mandando as informações pro banco de dado
    try {
        await db.collection('participants').insertOne({ ...req.body, lastStatus: now.valueOf() });
        await db.collection('messages').insertOne({ from: name, to: 'Todos', text: 'entra na sala...', type: 'status', time: now.format('HH:mm:ss') });
        return res.sendStatus(201);
    } catch (error) {
        console.error("erro na rota post /participants", error);
        return res.sendStatus(500);
    }

});

app.get("/messages", async (req, res) => {
    // buscando mensagens
    const { user } = req.headers.user;
    const limit = req.query.limit;
    try {
        const messageList = await db.collection("messages").find({ $or: [{ from: req.headers.user }, { to: req.headers.user }, { to: 'Todos' }] }).toArray();
        if (limit) {
            const sizeLimited = messageList.splice(0, limit);
            return res.send(sizeLimited);
        }
        return res.send(messageList);
    } catch (error) {
        console.error("erro na rota get /messages", error);
        return res.sendStatus(500);
    }

});

app.post("/messages", async (req, res) => {
    // inserindo mensagens
    const user = req.headers.user;
    const hora = dayjs().format('HH:mm:ss');
    const completeMessage = { ...req.body, from: user, time: hora };
    if (!validData(messageSchema, req.body) || !validData(headerSchema, user)) {
        return res.sendStatus(422);
    }
    try {
        await db.collection('messages').insertOne(completeMessage);
        return res.sendStatus(201);
    } catch (error) {
        console.error("erro na rota post /participants", error);
        return res.sendStatus(500);
    }
});

app.post("/status", (req, res) => {

});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}...`)
});