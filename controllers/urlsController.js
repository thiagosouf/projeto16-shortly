import db from "../db/db.js";
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';


// postShorten
export async function postShorten(req, res) {
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
}

// getId
export async function getId(req, res) {
    const {id} = req.params;
    try{
        const result = await db.query(`SELECT * FROM links WHERE "id" = $1`, [id]);
        res.status(200).json(result.rows[0]);
    }
    catch(err){
        res.status(422).send(err);
    }

}

//getShortUrl
export async function getShortUrl(req, res) {
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
}

//deleteId
export async function deleteId(req, res) {
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
}