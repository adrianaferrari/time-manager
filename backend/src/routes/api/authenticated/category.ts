import { asyncWrapper } from '@cdellacqua/express-async-wrapper';
import { Router } from 'express';
import * as category from '../../../services/category';

const r: Router = Router();
export default r;

r.get('/', asyncWrapper(async (_, res) => {
	res.json(await category.findAll({ userId: res.locals.user.id }));
}));
