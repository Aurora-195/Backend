import mongoose from "mongoose";
import { v4 as uuidv4 } from 'uuid';

const userSchema = mongoose.Schema(
    {
        login: {
            type: String,
            required: true,
            unique: [true, "This login is already taken. Please try to use a different one"],
            trim: true,
            minlength: 3,
            maxLength: 20
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
            maxLength: 20,
            trim: true
        },
        name: {
            type: String,
            required: true,
            minlength: 6,
            maxLength: 20,
            trim: true
        }
    },


)
const Users = mongoose.model("Users", userSchema);
export default Users;