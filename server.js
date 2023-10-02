import express from 'express';

dotenv.config();
import cors from 'cors';
import axios from 'axios';

import usersRoutes from './routes/users.js';
import * as dotenv from "dotenv";

const app = express();
const PORT = 5000;

app.use(cors());
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
    app.listen(PORT, () => {
        console.log(`Server started at port ${PORT}`);
    })

} ).catch((error)=> {
    console.log(error);
});


