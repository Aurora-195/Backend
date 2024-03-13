import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';
import axios from 'axios';
import fs from "fs";
import https from "https";
import cors from "cors";
import usersRoutes from './routes/users.js';
import * as dotenv from "dotenv";
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import session from 'express-session';

dotenv.config();



const app = express();
const PORT = 443;

// Determine the directory name of the current module.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/auroratime.org/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/auroratime.org/fullchain.pem')
};

// Dynamic CORS configuration
const allowedOrigins = ['http://localhost:5173', 'https://auroratime.org'];


// Configure session middleware - required for Passport authentication to persist session info
app.use(session({
    secret: process.env.SESSION_SECRET, // Replace 'secret' with a real secret key
    resave: false,
    saveUninitialized: true,
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());
passport.use(new GoogleStrategy({
        clientID: process.env.OAUTH_CLIENT_ID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        callbackURL: "https://auroratime.org/auth/google/callback"
    },
    (accessToken, refreshToken, profile, done) => {
        // In a production application, you would typically find or create a user in your database here.
        // For simplicity, we're just passing the profile which includes user information.
        return done(null, profile);
    }
));
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Route to start the OAuth flow

// OAuth callback route
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/');
});

app.get('/auth/google', (req, res) => {
    // Redirect to Google's OAuth 2.0 server
    const queryParams = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        redirect_uri: 'https://yourserver.com/auth/google/callback',
        response_type: 'code',
        scope: 'email profile',
        access_type: 'offline', // For getting a refresh token
    }).toString();
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${queryParams}`;
    res.redirect(googleAuthUrl);
});

app.get('/auth/google/callback', async (req, res) => {
    // Google redirects here with an authorization code in req.query.code
    const code = req.query.code;
    console.log("auth/google/callback call with code: "+code);
    // Exchange code for tokens and link user's Google account with your app's account
    // Send response back to the client, e.g., a success message or redirect
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
        code: code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: 'https://auroratime.org/auth/google/callback',
        grant_type: 'authorization_code',
    });
    const tokens = tokenResponse.data;
    console.log("auth/google/callback tokens = : "+ tokens);
// Here you should link the Google account with the user's account in your app,
// potentially using the tokens to retrieve user info from Google if necessary.

// Redirect the user back to your app or send a success response.

});

app.post('/webhook', express.json(), (req, res) => {
    const { queryResult } = req.body;
    const activityName = queryResult.parameters['activity_name']; // Ensure parameter names match
    const duration = queryResult.parameters['duration'];
    //const userId = req.body.originalDetectIntentRequest.payload.user.userId; // This requires account linking

    // Process the activity logging using the activityName and duration

    res.json({
        fulfillmentText: `Logged ${activityName} for ${duration.amount} ${duration.unit}.`
    });
    console.log("webhook call with activityName = "+ activityName + ", duration = "+ duration.amount);
});



// Here you should link the Google account with the user's account in your app,
// potentially using the tokens to retrieve user info from Google if necessary.

// Redirect the user back to your app or send a success response.


app.use(compression());


app.use(cors({
    origin: function(origin, callback){
        // Allow requests with no origin (like mobile apps or curl requests)
        if(!origin) return callback(null, true);
        if(allowedOrigins.includes(origin)){
            return callback(null, true); // Reflect the origin if it's in the allowed list
        } else {
            var msg = 'The CORS policy for this site does not ' +
                      'allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
    },
    credentials: true // Needed for cookies, authorization headers with HTTPS
}));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../AuroraWeb/client/dist')));

app.use(express.json());

app.use('/users', usersRoutes);
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});


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


