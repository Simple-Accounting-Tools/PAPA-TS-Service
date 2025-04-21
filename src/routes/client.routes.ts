import { Router } from 'express';
import {
    createClient,
    getClients,
    getClientById,
    updateClient,
    deleteClient,
} from '../controllers/client.controller';

const router = Router();

router
    .route('/')
    .post(createClient)
    .get(getClients);

router
    .route('/:clientId')
    .get(getClientById)
    .put(updateClient)
    .delete(deleteClient);

export default router;
