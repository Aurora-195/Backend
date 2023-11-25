import express from 'express';
import { v4 as uuidv4 } from 'uuid';

import { getUsers, getUser, createUser, login, deleteUser, updateUser, logActivity  } from '../controllers/users.js';
import {createActivities, startActivity, endActivity, editActivity, deleteActivity} from '../controllers/activity.controller.js';

const router = express.Router();


//all routes here starts with "/users"
router.get('/', getUsers);

router.post('/register', createUser);
router.post('/login', login);

// Create, edit, and delete activity
router.post('/:id/activities', createActivities);
router.post('/:id/start-activity', startActivity);
router.post('/:id/end-activity', endActivity);
router.patch('/:id/edit-activity', editActivity);
router.delete('/:id/delete-activity', deleteActivity);

router.post('/:id', logActivity);

router.get('/:id', getUser);
router.delete('/:id', deleteUser);

router.patch('/:id', updateUser);

export default router;