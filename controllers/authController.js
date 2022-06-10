import db from "../db/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// postSignup
export async function postSignup(req, res) {
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
        }

// postSignin
export async function postSignin(req, res) {
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
    }