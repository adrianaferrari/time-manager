import { Router } from 'express';
import userRoutes from './user';
import downloadRoutes from './download';
import authenticatedRoutes from './authenticated';

const r: Router = Router();
export default r;

r.use('/user', userRoutes);

r.use('/download', downloadRoutes);

// TODO: if you want to change the prefix for the authenticated routes, change the first argument in the following function call
r.use('/auth', authenticatedRoutes);
