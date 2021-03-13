import { Router } from 'express';

import CategoryController from '../controllers/category';

const router = Router();

router.route('/categories').get(CategoryController.list);

export default router;
