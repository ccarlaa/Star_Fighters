import express from "express";
import { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import joi from "joi";
import axios from "axios";

import connection from "./db.js";

const app = express();
app.use(express.json());
app.use(cors());

dotenv.config()

app.post("/battle", async (req: Request, res: Response) => {
    const { firstUser, secondUser } : { firstUser: string, secondUser: string } = req.body;
    const bodySchema = joi.object({
        firstUser: joi.string()
            .required(),
        secondUser: joi.string()
            .required()
    })
    const bodyValidation = bodySchema.validate(req.body)
    if(bodyValidation.error){
        res.status(422).send("Insira um nome válido");
        return;
    }
    try {
        const firstUserInfos = await axios.get(`https://api.github.com/users/${firstUser}/repos`)
        let starNumberFirstUser: number = 0;
        for(let repository of firstUserInfos.data){
            starNumberFirstUser += repository.stargazers_count;
        }
        const secondUserInfos = await axios.get(`https://api.github.com/users/${secondUser}/repos`)
        let starNumberSecondUser: number = 0;
        for(let repository of secondUserInfos.data){
            starNumberSecondUser += repository.stargazers_count;
        }
        let returnFront: object = { "winner": "", "loser": "", "draw": ""};
        if(starNumberFirstUser > starNumberSecondUser){
            returnFront = {
                "winner": firstUser,
                "loser": secondUser,
                "draw": false
            }
            await connection.query(`
                INSERT INTO 
                    fighters (username, wins, losses, draws)
                VALUES
                    ($1, $2, $3, $4)
            `, [firstUser, 1, 0, 0]);
            await connection.query(`
                INSERT INTO 
                    fighters (username, wins, losses, draws)
                VALUES
                    ($1, $2, $3, $4)
            `, [secondUser, 0, 1, 0]);
        } else if (starNumberFirstUser < starNumberSecondUser){
            returnFront = {
                "winner": secondUser,
                "loser": firstUser,
                "draw": false
            }
            await connection.query(`
                INSERT INTO 
                    fighters (username, wins, losses, draws)
                VALUES
                    ($1, $2, $3, $4)
            `, [secondUser, 1, 0, 0]);
            await connection.query(`
                INSERT INTO 
                    fighters (username, wins, losses, draws)
                VALUES
                    ($1, $2, $3, $4)
            `, [firstUser, 0, 1, 0]);
        } else {
            returnFront = {
                "winner": null,
                "loser": null,
                "draw": true
            }
            await connection.query(`
                INSERT INTO 
                    fighters (username, wins, losses, draws)
                VALUES
                    ($1, $2, $3, $4)
            `, [firstUser, 0, 0, 1]);
            await connection.query(`
                INSERT INTO 
                    fighters (username, wins, losses, draws)
                VALUES
                    ($1, $2, $3, $4)
            `, [secondUser, 0, 0, 1]);
        }
        res.status(201).send(returnFront) 
    } catch (err) {
        console.log(err)
    }
})


const port = process.env.PORT
app.listen(port, () => {
    console.log(`|-----------------------------------|`)
    console.log(`| Running at http://localhost:${port}  |`)
    console.log(`|-----------------------------------|`)
})