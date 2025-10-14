import express from 'express';
import cors from 'cors';
import dotenv from "dotenv";
import {connectDB} from './pool';
const app = express();
import bodyParser from 'body-parser';
const PORT = process.env.PORT || 3000;
dotenv.config();
import morgan from "morgan";

//Routers
import UserRouter from './Routers/UserRouter'

app.use(cors());
app.use(express.json());
app.use(morgan("dev"))
app.use(bodyParser.urlencoded({
    extended: true,
}));

app.listen(PORT, async (err) => {
    if (err) {
        console.log(err.message);
    }
    console.log(`Server is running on port: ${PORT}`);
    await connectDB();
});

app.use("/api/user", UserRouter);
