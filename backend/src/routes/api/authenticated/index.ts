import { Router } from 'express';
import userRoutes from './user';
import activityRoutes from './activity';
import categoryRoutes from './category';
import projectRoutes from './project';
import authMiddleware from './_middleware';

const r: Router = Router();
export default r;

r.use(authMiddleware);

r.use('/user', userRoutes);

r.use('/activity', activityRoutes);

r.use('/category', categoryRoutes);

r.use('/project', projectRoutes);
