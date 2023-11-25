import mongoose from "mongoose";
import { v4 as uuidv4 } from 'uuid';

const activitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: [true, "There is already an activity with the same name"]
    },
    startTime: {
        type: Date
    },
    endTime: {
        type: Date
    }}, {
        timestamps: true,
});

const userSchema = mongoose.Schema(
    {
        login: {
            type: String,
            required: true,
            unique: [true, "This login or email is already taken. Please try to use a different one"],
            trim: true,
            minlength: 4,
            maxLength: 35
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
            maxLength: 20,
            trim: true
        },
        activities: [activitySchema]
    }
)

const Users = mongoose.model("Users", userSchema);
export default Users;