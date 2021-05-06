import { asyncWrapper } from '@cdellacqua/express-async-wrapper';
import { Router } from 'express';
import * as project from '../../../services/project';

const r: Router = Router();
export default r;

r.get('/', asyncWrapper(async (_, res) => {
	res.json(await project.findAll({ userId: res.locals.user.id }));
}));
