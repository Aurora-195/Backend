import {v4 as uuidv4} from "uuid";

import axios from "axios";
import bcrypt from 'bcrypt';

export const DB_DATA = {
    dataSource: "TimeManagementEcosystem",
    database: "test",
    collection: "users"
};

const testActivities = [
    {
        name: "studying",
        instances: [
            {
                startTime: "2023-10-01T09:00:00Z",
                endTime: "2023-10-01T11:00:00Z",
                status: "completed"
            },
            {
                startTime: "2023-10-02T14:00:00Z",
                endTime: "2023-10-02T16:30:00Z",
                status: "completed"
            },
            {
                startTime: "2023-10-04T08:00:00Z",
                endTime: "2023-10-04T10:00:00Z",
                status: "completed"
            },
            {
                startTime: "2023-10-05T17:00:00Z",
                endTime: "2023-10-05T19:00:00Z",
                status: "completed"
            }
            // ... additional instances
        ]
    },
    {
        name: "procrastination",
        instances: [
            {
                startTime: "2023-10-01T12:00:00Z",
                endTime: "2023-10-01T13:00:00Z",
                status: "completed"
            },
            {
                startTime: "2023-10-03T11:00:00Z",
                endTime: "2023-10-03T12:30:00Z",
                status: "completed"
            },
            {
                startTime: "2023-10-05T09:30:00Z",
                endTime: "2023-10-05T11:00:00Z",
                status: "completed"
            }
            // ... additional instances
        ]
    },
    {
        name: "meditation",
        instances: [
            {
                startTime: "2023-10-02T07:00:00Z",
                endTime: "2023-10-02T07:30:00Z",
                status: "completed"
            },
            {
                startTime: "2023-10-03T06:45:00Z",
                endTime: "2023-10-03T07:15:00Z",
                status: "completed"
            },
            {
                startTime: "2023-10-06T07:00:00Z",
                endTime: "2023-10-06T07:30:00Z",
                status: "completed"
            }
            // ... additional instances
        ]
    },
    {
        name: "sport",
        instances: [
            {
                startTime: "2023-10-01T16:00:00Z",
                endTime: "2023-10-01T17:30:00Z",
                status: "completed"
            },
            {
                startTime: "2023-10-03T16:00:00Z",
                endTime: null,
                status: "ongoing"
            },
            {
                startTime: "2023-10-05T15:00:00Z",
                endTime: "2023-10-05T16:00:00Z",
                status: "completed"
            }
            // ... additional instances
        ]
    }
];

export const getUsers = async (req,res)=>{
    try {
        const response = await axios.post(`action/find`, DB_DATA);
        const users = response.data;
        res.status(200).json(users);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
}

// This is LOGIN function
export const getUser = async (req, res) => {
    const id = req.params.id;

    try {
        const response = await axios.post('action/findOne', {
            ...DB_DATA,
            filter: { "id": id } // This is the filter to match the required ID
        });
        const user = response.data.document;

        if (!user) {
            return res.status(404).json({message: `cannot find user with ID ${id}`});
        }

        const {login, password} = user;

        const passwordMatch = await bcrypt.compare(req.body.password, password);

        if (!passwordMatch) {
            return res.status(401).json({message: 'Incorrect password'});
        }

        console.log(`Successful login: user ID: ${id}`);
        res.status(200).json(user);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({message: error.message});
    }
};
// This is the register feature
export const createUser = async (req, res) => {
    console.log("attempting to create user");
    async function userExists(login) {
        const response = await axios.post('action/findOne', {
            ...DB_DATA,
            filter: {"login": login} // This is the filter to match the required ID
        });
        const user = response.data.document;
        return !!user;
    }

    try {
        const { login, password } = req.body;

        // Validate that both login and password are present
        console.log(req.body);
        if (!login || !password) {
            return res.status(400).json({ message: 'Both login and password are required.' });
        }

        // Check if the email or login is taken
        if(await userExists(login)){
            return res.status(409).json({ message: 'User with the provided login already exists. Try to login or request a password change.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            id: uuidv4(),
            login,
            password: hashedPassword,
            activities: []
            //test activities
            //activities: testActivities

        };

        const response = await axios.post(`action/insertOne`, {
            ...DB_DATA,
            document: newUser
        });

        const insertedId = response.data.insertedId;

        if (!insertedId) {
            return res.status(400).json({ message: "Failed to create user." });
        }

        res.status(200).json({
            message: "Registration successful.",
            user: {
                id: newUser.id,
                login: newUser.login,
                activities: newUser.activities
            }
        });
    } catch (error) {
        console.error("API request error:", error.response ? error.response.data : error.message);
        return res.status(500).json({ message: "Internal server error." });
    }
};

export const login = async (req, res) => {
    console.log("attempting to log in user");
    async function findUser(login) {
        const response = await axios.post('action/findOne', {
            ...DB_DATA,
            filter: {"login": login} // This is the filter to match the login
        });
        return response.data.document;
    }

    try {
        const { login, password } = req.body;

        // Validate that both login and password are present
        if (!login || !password) {
            return res.status(400).json({ message: 'Both login and password are required.' });
        }

        // Find the user by login
        const user = await findUser(login);
        if (!user) {
            return res.status(401).json({ message: 'Login failed. User not found.' });
        }

        // Compare submitted password with stored hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Login failed. Incorrect password.' });
        }
        // Here we can assign session tokens if we need it

        // Respond with success and user data (omit sensitive data like password)
        res.status(200).json({
            message: "Login successful.",
            user: {
                id: user.id,
                login: user.login,
                activities: user.activities
            }
        });
    } catch (error) {
        console.error("Login API request error:", error.response ? error.response.data : error.message);
        return res.status(500).json({ message: "Internal server error." });
    }
};


export const deleteUser = async (req, res) => {
    const id = req.params.id;

    try {
        const response = await axios.post(`action/deleteOne`, {
            ...DB_DATA,
            filter: { "id": id }
        });

        if (response.data.deletedCount === 0) {
            return res.status(404).json({ message: `Cannot find user with ID ${id}` });
        }

        res.status(200).send(`User with ID ${id} has been deleted.`);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
};


export const updateUser = async (req, res) => {
    const id = req.params.id;
    const updatedData = req.body;

    try {
        const response = await axios.post(`action/updateOne`, {
            ...DB_DATA,
            filter: {
                "id": id
            },
            update: {
                "$set": updatedData
            }
        });

        if (response.data.matchedCount === 0) {
            return res.status(404).json({ message: `Cannot find user with ID ${id}` });
        }

        // Fetch the updated user
        const updatedUserResponse = await axios.post(`action/findOne`, {
            ...DB_DATA,
            filter: {
                "id": id
            }
        });

        const updatedUser = updatedUserResponse.data.document;
        res.status(200).json(updatedUser);

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
};

// This is function to add an activity to user's activity list
export const logActivity = async (req, res) => {
    const id = req.params.id;
    const updatedData = req.body;

    try {
        const response = await axios.post(`action/updateOne`, {
            ...DB_DATA,
            filter: {
                "id": id
            },
            update: {
                "$set": updatedData
            }
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
};

export async function findUserById(id) {
    const response = await axios.post('action/findOne', {
        ...DB_DATA,
        filter: {"id": id} // This is the filter to match the login
    });
    return response.data.document;
}

