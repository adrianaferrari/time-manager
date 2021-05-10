import { Router } from 'express';
import userRoutes from './user';
import activityRoutes from './activity';
import categoryRoutes from './category';
import clientRoutes from './client';
import companyRoutes from './company';
import projectRoutes from './project';
import technologyRoutes from './technology';
import authMiddleware from './_middleware';

const r: Router = Router();
export default r;

r.use(authMiddleware);

r.use('/user', userRoutes);

r.use('/activity', activityRoutes);

r.use('/category', categoryRoutes);

r.use('/client', clientRoutes);

r.use('/company', companyRoutes);

r.use('/project', projectRoutes);

r.use('/technology', technologyRoutes);
