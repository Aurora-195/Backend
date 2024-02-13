import express from 'express';
import { v4 as uuidv4 } from 'uuid';

import { getUsers, getUser, createUser, login, deleteUser, updateUser } from '../controllers/users.js';
import {createActivities, startActivity, endActivity, getCurrentActivity, logActivity} from '../controllers/activity.controller.js';

const router = express.Router();


//all routes here starts with "/users"
router.get('/', getUsers);

router.post('/register', createUser);
router.post('/login', login);

// Create, edit, and delete activity
// works
router.get('/:id/get-current-activity', getCurrentActivity);
router.post('/:id/start-activity', startActivity);
router.post('/:id/end-activity', endActivity);

// should work
// Requires user id and activities
router.post('/:id/createActivities', createActivities);
// Requires user id and activity instance object
router.post('/:id', logActivity);


router.get('/:id', getUser);
router.delete('/:id', deleteUser);

router.patch('/:id', updateUser);
export default router;