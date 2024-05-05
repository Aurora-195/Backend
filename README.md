# Aurora Time Management Ecosystem

Welcome to the **Aurora Time Management Ecosystem Backend**. This repository hosts a comprehensive platform designed to streamline personal and organizational time management. This ecosystem includes a Node.js server (this repo) and a React client [this repo](https://github.com/Aurora-195/AuroraWeb) to provide a seamless user experience.

## Project Structure

This server structure is designed for a server (for example AWS EC2) to serve static client files of the webpage and handle backend operations. For correct functioning - it requires having the client from the AuroraWeb repo to be **built** inside a folder *client* in this repo. 

## Features

- **Ecosystem Backend**: Authorization, Activity Recording and Management handling.
- **Activity Logging**: Log various time-based activities through a webhook.
- **CORS Configuration**: Flexible CORS setup for different environments.
- **Compression**: Gzip compression for optimized data delivery.
- **Session Management**: Secure session management for persistent user authentication.
- **Static File Serving**: Efficient delivery of static files via the Node server.

## Prerequisites

- **Node.js**: v16 or later.
- **npm**: For managing dependencies.
- **MongoDB**: An existing MongoDB Atlas or local cluster.
- **SSL Certificates**: An active SSL certificate if deploying the server over HTTPS.

## Environment Setup

1. **Server Setup**:
   - Clone the repository:  
     ```bash
     git clone https://github.com/your_username/aurora-time-management.git
     ```
   - Install dependencies:
     ```bash
     cd aurora-time-management/server
     npm install
     ```
   - Create a `.env` file:
     ```bash
     touch .env
     ```
   - Add the following environment variables in the `.env` file:
     ```env
     SESSION_SECRET=<your_session_secret>
     OAUTH_CLIENT_ID=<your_google_client_id>
     OAUTH_CLIENT_SECRET=<your_google_client_secret>
     MONGO_API_KEY=<your_mongodb_api_key>
     ```
   - Replace the paths in the SSL certificate object:
     ```javascript
     const options = {
         key: fs.readFileSync('/path/to/privkey.pem'),
         cert: fs.readFileSync('/path/to/fullchain.pem')
     };
     ```
   - Start the server:
     ```bash
     npm start
     ```
   - Server will be up and running at `https://localhost:443` (make sure this port is accessible in your network)

2. **Client Setup**:
   - Change to the `client` directory:
     ```bash
     cd ../client
     ```
   - Install client dependencies:
     ```bash
     npm install
     ```
   - Update the API endpoints in the client configuration.
   - Start the client:
     ```bash
     npm run dev
     ```

## Usage

### Google OAuth Flow

- Visit `/auth/google` to start the OAuth flow.
- Upon successful authentication, the user will be redirected back to the client homepage.

### Webhook Activity Logging

- Send a POST request to `/webhook` to log time-based activities.

### Users Management

- Access `/users` for user management.

## Troubleshooting

1. **OAuth Issues**: Make sure your Google API credentials are set up correctly and that the callback URL is consistent.
2. **CORS Errors**: Review the `allowedOrigins` list to ensure the client origin is included.
3. **SSL Errors**: Verify that the SSL certificates are accessible and valid.

## Contributing

We welcome contributions from the community. Feel free to fork this repository and create a pull request for any improvements.
