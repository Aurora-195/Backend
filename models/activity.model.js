import mongoose from "mongoose";
import { v4 as uuidv4 } from 'uuid';

const activitySchema = new Schema({
    username: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    date: { type: Date, required: true },
}, {
    timestamps: true,
});

const Activities = mongoose.model("Activities", activitySchema);
export default Activities;