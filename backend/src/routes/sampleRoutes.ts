import { Router } from 'express';
import { getSamples } from '../controllers/sampleController';

const router = Router();

router.get('/', getSamples);

export default router;
