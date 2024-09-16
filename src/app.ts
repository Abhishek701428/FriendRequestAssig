import express from 'express';
import { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors'
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();
import connectToMongo from './database/db';
import router from './Controller/user.routes';
const app = express();
connectToMongo();



app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({
    origin: '*'
  }));


  
app.use('/api', router);
//   Routes 
app.get('/', (req: Request, res: Response) => {
    res.send("Hi, I am TypeScript! Any problem . Noo!!");
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

