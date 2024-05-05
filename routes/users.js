import express from 'express';
import { v4 as uuidv4 } from 'uuid';

import { getUsers, getActivities, createUser, login, deleteUser, updateUser } from '../controllers/users.js';
import {createActivities, startActivity, endActivity, getCurrentActivity, logActivity, deleteInstance, editInstance} from '../controllers/activity.controller.js';

const router = express.Router();


//all routes here starts with "/users"
router.get('/', getUsers);

router.post('/register', createUser);
router.post('/login', login);

// Create, edit, and delete activity

router.get('/:id/get-current-activity', getCurrentActivity);
router.post('/:id/start-activity', startActivity);
router.post('/:id/end-activity', endActivity);


router.post('/:id/createActivities', createActivities);

// Requires user id and activity instance object
router.post('/:id', logActivity);


router.get('/:id', getActivities);
router.post('/:id/deleteActivityInstance', deleteInstance)
router.post('/:id/editActivityInstance', editInstance)
router.delete('/:id', deleteUser);

router.patch('/:id', updateUser);
export default router;