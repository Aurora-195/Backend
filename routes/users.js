import express from 'express';
import { v4 as uuidv4 } from 'uuid';

import { getUsers, getUser, createUser, deleteUser, updateUser, logActivity  } from '../controllers/users.js';


const router = express.Router();


//all routs here starts with "/users"
router.get('/', getUsers);

router.post('/', createUser);
router.post('/:id', logActivity);

router.get('/:id', getUser);
router.delete('/:id', deleteUser);

router.patch('/:id', updateUser);
export default router;