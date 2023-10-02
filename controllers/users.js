import {v4 as uuidv4} from "uuid";
import Users from '../models/user.model.js';
import axios from "axios";
const DB_DATA = {
    dataSource: "TimeManagementEcosystem",
    database: "test",
    collection: "users"
};

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

        res.status(200).json(user);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({message: error.message});
    }
};
export const createUser = async (req, res) => {
    try {
        const { firstName, lastName } = req.body;

        // Validate that both firstName and lastName are present
        console.log(req.body);
        if (!firstName || !lastName) {
            return res.status(400).json({ message: 'Both firstName and lastName are required.' });
        }

        const newUser = {
            id: uuidv4(),
            firstName,
            lastName,
            activities: []
        };

        const response = await axios.post(`action/insertOne`, {
            ...DB_DATA,
            document: newUser
        });

        const insertedId = response.data.insertedId;

        if (!insertedId) {
            return res.status(400).json({ message: "Failed to create user." });
        }

        res.status(201).json({ ...newUser, _id: insertedId });
    } catch (error) {
        console.error("API request error:", error.response ? error.response.data : error.message);
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


