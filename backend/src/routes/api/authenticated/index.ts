import { Router } from 'express';
import userRoutes from './user';
import authMiddleware from './_middleware';

const r: Router = Router();
export default r;

r.use(authMiddleware);

r.use('/user', userRoutes);
