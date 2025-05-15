import { Router } from 'express';
import {
    createUser,
    getUsers,
    getUser,
    updateUser,
    deleteUser,
} from '../controllers/user.controller';
const router = Router();

router.route('/')
    .post(createUser)
    .get(getUsers);

router.route('/:userId')
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser);

export default router;