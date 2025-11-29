import { Request, Response } from "express";
import { pool } from "../pool";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import { QueryResultRow } from "pg";
import jwt, { type JwtPayload } from "jsonwebtoken"
import 'dotenv/config'
export interface UserDB {
    username: string,
    email: string,
    password: string,
    id: number,
    user_id: string,
};
export const register = async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Please provide all user details",
            });}
        const user: QueryResultRow = await pool.query("SELECT * FROM users WHERE email = $1 OR username = $2;", [email, username, ]);
        if (user.rows.length > 0) {
            const existingUser: UserDB = user.rows[0];
            if (existingUser.email === email) {
                if (existingUser.username === username) {
                    return res.status(400).json({
                        message: "User with this email and username already exists",
                });
                }
                return res.status(400).json({
                    message: "User with this email already exists",
                });
            } 
            if (existingUser.username === username) {
                return res.status(400).json({
                    message: "User with this username already exist",
                })
            }
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const query: string = `INSERT INTO users (username, email, password, user_id) VALUES ($1, $2, $3, $4);`
        await pool.query(query, [username, email, hashedPassword, uuid()])
        return res.status(200).json({
            message: "User registered succesfully",
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

export const login = async (req: Request, res: Response) => {
    try {   
        const { email, password } = req.body;
        if (!email || !password) { 
            return res.status(400).json({
                message: "Please provide all user details",
            });
        }
        const user = await pool.query("SELECT * FROM users WHERE email=$1;", [email,]);
        if (user.rows.length === 0) {
            return res.status(400).json({
                message: `There is no user with the email: ${email}`,
            });
        }
        const validPassword: boolean = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) {
            return res.status(400).json({
                message: "Invalid password please try again",
            });
        }

        const jwtSecretKey: string = process.env.ACCESS_TOKEN_SECRET as string;
        const payload: { userID: string } = {
            userID: user.rows[0].user_id,
        };
        const jwtToken: string = jwt.sign(payload, jwtSecretKey, { expiresIn: '15m' });

        return res.status(200).json({
            message: "User logged in succesfully",
            id: user.rows[0].user_id,
            username: user.rows[0].username,
            email: user.rows[0].email,
            token: jwtToken,
        });
    } catch (err) {
        return res.status(200).json({
            message: "Internal Server Error",
        });
    }
};
interface UserPayload extends JwtPayload {
  userID: string;
}
export const authenticateToken = (req: Request, res: Response) => {
    try {
        const jwtSecretKey: string = process.env.ACCESS_TOKEN_SECRET as string;
        const authorizationToken: string = req.headers['authorization']?.split(' ')[1] as string;
        if (!authenticateToken) return res.status(401).json({message: "Authentication unsuccesful"});
        const verify: string | UserPayload = jwt.verify(authorizationToken, jwtSecretKey) as UserPayload;
        if (verify) {
            return res.status(200).json({message: "Authentication succesful", userID: verify.userID});
        } else {
            return res.status(401).json({message: "Authentication unsuccesful"});
        };
    } catch(err) {
        if (err instanceof Error) {
            return res.status(401).json({message: `An error has occured: ${err.message}`});
        } {
            return res.status(401).json({message: "An unexpected error has occured"});
        };
    };
};