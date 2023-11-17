import express from 'express';

dotenv.config();
import cors from 'cors';
import axios from 'axios';

import usersRoutes from './routes/users.js';
import * as dotenv from "dotenv";

const app = express();
const PORT = 80;

const allowedOrigins = ['https://localhost:5173', 'https://auroratime.org'];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // This is important.
    methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD'], // You can add or remove methods as needed
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors());
//app.use(cors(corsOptions));

app.use(express.json());

app.use('/users', usersRoutes);

app.get('/', (req, res) => {
    res.send('Hello from Homepage');
});


async function connect(){
    try{
        const API_ENDPOINT = 'https://us-west-2.aws.data.mongodb-api.com/app/data-llkis/endpoint/data/v1/';
        const API_KEY = process.env.MONGO_API_KEY;

        axios.defaults.baseURL = API_ENDPOINT;
        axios.defaults.headers.common['api-key'] = API_KEY;
        axios.defaults.headers.common['Content-Type'] = 'application/json';
    } catch (error){
        console.error(error);
    }
}


connect().then(r =>{
    console.log("Connected to MongoDB");
    app.listen(PORT, '0.0.0.0',() => {
        console.log(`Server started at port ${PORT}`);
    })

} ).catch((error)=> {
    console.log(error);
});


