import { Router } from 'express';
import {
    createProfile,
    getProfiles,
    getProfile,
    updateProfile,
    deleteProfile,
} from '../controllers/profile.controller';

const router = Router();

router.route('/')
    .post(createProfile)
    .get(getProfiles);

router.route('/:profileId')
    .get(getProfile)
    .put(updateProfile)
    .delete(deleteProfile);

export default router;
