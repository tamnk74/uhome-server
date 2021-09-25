import { Router } from 'express';

import VersionController from '../controllers/version';

const router = Router();

router.get('/versions/:type', VersionController.getVersion);

export default router;
