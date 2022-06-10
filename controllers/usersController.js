import db from "../db/db.js";
import jwt from 'jsonwebtoken';

// getUsers
export async function getUsers(req, res) {
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
        
        }

// getRanking
export async function getRanking(req, res) {
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
    
    }