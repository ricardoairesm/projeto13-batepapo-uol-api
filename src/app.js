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

const hora = dayjs().format('HH:mm:ss')

const messageSchema = Joi.object().keys({
    type: Joi.string().valid('message', 'private-message').required(),
    to: Joi.string().required(),
    text: Joi.string().required(),
    from: Joi.string().required(),
});

const nameSchema = Joi.object().keys({
    name:Joi.string().required()
})


const validateMessage = (message) => {
    const result = Joi.validate(message, messageSchema);
    if (result.error) {
        throw result.error;
    }
    return result.value;
}

const validateName = (name) => {
    const result = Joi.validate(name, nameSchema);
    if (result.error) throw result.error;
    return result.value;
}
try {
    const validMessage = validateMessage({ type: 'message' });
    console.log(validMessage); // { type: 'message' }
} catch (error) {
    console.log("Mensagem com formato inválido!");
}



// conectando ao banco
const mongoClient = new MongoClient(process.env.DATABASE_URL);
let db;

await mongoClient.connect();
db = mongoClient.db();


app.get("/participants", async(req, res) => {
    // buscando usuários
    try {
        const userList = await db.collection("participants").find({}).toArray();
        return res.send(data);
    } catch (error) {
        console.error("erro na rota get /participants", error);
        return res.sendStatus(500);
    }
});

app.post("/participants", async(req, res) => {
    // inserindo usuário
    const { name } = req.body;
    //validando usuario
    try {
        const validName = validateName(req.body);
        console.log(validName); 
    } catch (error) {
        console.log("Nome com formato inválido!");
        res.sendStatus(422);
        return;
    }
    //checando se o nome de usuario já existe
    const user = await db.collection("participants").findOne(name);
    if (user){
        res.sendStatus(409);
        return;
    }; 
    //construindo os objetos a serem mandados pro nosso banco de dados
    const entryMessageFormat = {from: name, to: 'Todos', text: 'entra na sala...', type: 'status', time: hora};
    const userFormat = {name: name, lastStatus: Date.now().valueOf()};
    try{
        await db.collection('participants').insertOne(userFormat);
        await db.collection('messages').insertOne(entryMessageFormat);
    
    }catch(error){
        console.error("erro na rota post /participants", error);
        return res.sendStatus(500);
    }
  
});

app.get("/messages", (req, res) => {
    // buscando mensagens

});

app.post("/messages", (req, res) => {
    // inserindo mensagens
});

app.post("/status", (req, res) => {

});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}...`)
});