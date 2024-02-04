import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import axios from 'axios';
import fs from "fs";
import https from "https";
import usersRoutes from './routes/users.js';
import * as dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = 443;

// Determine the directory name of the current module.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/auroratime.org/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/auroratime.org/fullchain.pem')
};

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../AuroraWeb/client/dist')));

app.use(express.json());

app.use('/users', usersRoutes);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../AuroraWeb/client/dist/index.html'));
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


connect().then(() =>{
    console.log("Connected to MongoDB");
    https.createServer(options, app).listen(PORT, () => {
        console.log(`Server started at port ${PORT}`);
    });

} ).catch((error)=> {
    console.log(error);
});


