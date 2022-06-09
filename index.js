import express, { json } from 'express';
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';

import db from "./db/db.js";


const app = express();
app.use(cors());
app.use(json());
dotenv.config();


app.post("/signup", async(req, res) => {
const {name, email, password, confirmPassword} = req.body;

    if(password !== confirmPassword) {
        res.status(422).send("Passwords do not match");
    }
    else{
        const validation = await db.query(`SELECT * FROM users WHERE email = $1`, [email]);
        if(validation.rows.length > 0) {
            res.status(422).send("Email already in use");
        }
        else{
            try{
            const hash = await bcrypt.hash(password, 10);
            const result = await db.query(`INSERT INTO users (name, email, password) VALUES ($1, $2, $3)`, [name, email, hash]);
            res.status(201).send("Usuario cadastrado");
        }
            catch(err){
                res.status(422).send(err);
            }   
    }
}
});

app.post("/signin", async(req, res) => {
    const {email, password} = req.body;
    try{
        const validation = await db.query(`SELECT * FROM users WHERE email = $1`, [email]);
        if(validation.rows.length > 0) {
            const user = validation.rows[0];
            const validPass = await bcrypt.compare(password, user.password);
            if(validPass) {
                    const token = jwt.sign({
                        id: user.id,
                        email: email,
                        password: password
                    }, process.env.SECRET, {
                        expiresIn: "1h"
                    });
                    console.log(token);
                    res.status(200).json({
                        authorization: token
                    });
                }
                else{
                    res.status(401).send("Email ou senha incorretos");
                }
            }
            else{
                res.status(401).send("Ususario não encontrado");
            }
        }
        catch(err){
            res.status(422).send(err);
        }
});

app.post("/urls/shorten", async(req, res) => {
    const {url} = req.body;
    const token = req.headers.authorization;
    const chave = process.env.SECRET;
        try{
        const dados = jwt.verify(token, chave);        
        const user = await db.query(`SELECT * FROM users WHERE email = $1`, [dados.email]);
        const userId = user.rows[0].id;
        const shortUrl = nanoid(8);
        try{
            const result = await db.query(`INSERT INTO links (url, "shortUrl", "userId") VALUES ($1, $2, $3)`, [url, shortUrl, userId]);
            res.status(201).json({
                shortUrl: shortUrl
            });
        }
        catch(err){
            res.status(422).send("Erro ao cadastrar url");
        }
    }
    catch(err){
        res.status(401).send("Token inválido");
    }
});

app.get("/urls/:id", async(req, res) => {
    const {id} = req.params;
    try{
        const result = await db.query(`SELECT * FROM links WHERE "id" = $1`, [id]);
        res.status(200).json(result.rows[0]);
    }
    catch(err){
        res.status(422).send(err);
    }

})

app.get("/urls/open/:shortUrl", async(req, res) => {
    const {shortUrl} = req.params;
    try{
        await db.query(`UPDATE links SET "counter" = "counter" + 1 WHERE "shortUrl" = $1`, [shortUrl]);
        const result = await db.query(`SELECT * FROM links WHERE "shortUrl" = $1`, [shortUrl]);
        console.log(result.rows[0].url);
        res.redirect(result.rows[0].url);
    }
    catch(err){
        res.status(404).send("Url não encontrada");
    
    }
});

app.delete("/urls/:id", async(req, res) => {
    const {id} = req.params;
    const token = req.headers.authorization;
    const chave = process.env.SECRET;
    try{
        const dados = jwt.verify(token, chave);
        const user = await db.query(`SELECT * FROM users WHERE email = $1`, [dados.email]);
        const userId = user.rows[0].id;
        console.log(userId);
        const result = await db.query(`DELETE FROM links WHERE "id" = $1 AND "userId" = $2`, [id, userId]);
        console.log(result)
        if (result.rowCount > 0) {
            res.status(200).send("Link deletado");
        }
        else{
            res.status(401).send("Link não encontrado ou Não autorizado");
        }
    }
    catch(err){
        res.status(422).send(err);
    }
});

app.get("/users/:id", async(req, res) => {
    const {id} = req.params;
    const token = req.headers.authorization;
    const chave = process.env.SECRET;
    try{
        const dados = jwt.verify(token, chave);
        if (dados.id === parseInt(id)) {
            const result = await db.query(`SELECT users.id, users.name, SUM(links.counter) AS "visitCount" FROM users JOIN links ON users.id = links."userId" WHERE users.id = $1 GROUP BY users.id`, [id]);
            const resultLinks = await db.query(`SELECT links.id, links."shortUrl", links.url, links.counter as "visitCount"  FROM links WHERE "userId" = $1`, [id]);
            result.rows[0].shortenedUrls = resultLinks.rows;   
            res.status(200).json(result.rows[0]);
        }
        else{
            res.status(401).send("Não autorizado");
        }
    }
    catch(err){
        res.status(422).send("Usuario não encontrado");
    }

})

app.get("/ranking", async(req, res) => {
    try{
        const result = await db.query(`SELECT users.id, users.name, COUNT(links.id) as "linksCount", SUM(links.counter) as "visitcounter" FROM users 
        JOIN links ON users.id = links."userId"
        GROUP BY users.id ORDER BY "visitcounter" 
        DESC
        LIMIT 10`);
        res.status(200).json(result.rows);
    }
    catch(err){
        res.status(422).send(err);
    }

})

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));