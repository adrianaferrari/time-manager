import { asyncWrapper } from '@cdellacqua/express-async-wrapper';
import { Router } from 'express';
import { query } from 'express-validator';
import * as stats from '../../../services/stats';
import * as project from '../../../services/project';
import * as company from '../../../services/company';
import * as client from '../../../services/client';
import { rejectOnFailedValidation } from '../../../helpers/validator';

const r: Router = Router();
export default r;

r.get('/payment/by-month', [
	query('from').optional({ nullable: true, checkFalsy: true }).isDate(),
	query('to').optional({ nullable: true, checkFalsy: true }).isDate(),
	rejectOnFailedValidation(),
], asyncWrapper(async (req, res) => {
	const fromDate = req.query.from ? new Date(req.query.from as string) : undefined;
	const toDate = req.query.to ? new Date(req.query.to as string) : undefined;
	const projectsByUser = await project.findIdsByUser(res.locals.user.id);
	res.json(await stats.paymentByMonth(projectsByUser, fromDate, toDate));
}));

r.get('/payment/by-client', [
	query('from').optional({ nullable: true, checkFalsy: true }).isDate(),
	query('to').optional({ nullable: true, checkFalsy: true }).isDate(),
	rejectOnFailedValidation(),
], asyncWrapper(async (req, res) => {
	const fromDate = req.query.from ? new Date(req.query.from as string) : undefined;
	const toDate = req.query.to ? new Date(req.query.to as string) : undefined;
	const clientsByUser = await client.findIdsByUser(res.locals.user.id);
	res.json(await stats.paymentByClient(clientsByUser, fromDate, toDate));
}));

r.get('/effort/by-month', [
	query('from').optional({ nullable: true, checkFalsy: true }).isDate(),
	query('to').optional({ nullable: true, checkFalsy: true }).isDate(),
	rejectOnFailedValidation(),
], asyncWrapper(async (req, res) => {
	const fromDate = req.query.from ? new Date(req.query.from as string) : undefined;
	const toDate = req.query.to ? new Date(req.query.to as string) : undefined;
	res.json(await stats.effortByMonth(res.locals.user.id, fromDate, toDate));
}));

r.get('/rate/by-project', [
	query('from').optional({ nullable: true, checkFalsy: true }).isDate(),
	query('to').optional({ nullable: true, checkFalsy: true }).isDate(),
	rejectOnFailedValidation(),
], asyncWrapper(async (req, res) => {
	const fromDate = req.query.from ? new Date(req.query.from as string) : undefined;
	const toDate = req.query.to ? new Date(req.query.to as string) : undefined;
	const projectsByUser = await project.findIdsByUser(res.locals.user.id);
	res.json(await stats.rateByProject(res.locals.user.id, projectsByUser, fromDate, toDate));
}));

r.get('/rate/by-company', [
	query('from').optional({ nullable: true, checkFalsy: true }).isDate(),
	query('to').optional({ nullable: true, checkFalsy: true }).isDate(),
	rejectOnFailedValidation(),
], asyncWrapper(async (req, res) => {
	const fromDate = req.query.from ? new Date(req.query.from as string) : undefined;
	const toDate = req.query.to ? new Date(req.query.to as string) : undefined;
	const companiesByUser = await company.findIdsByUser(res.locals.user.id);
	res.json(await stats.rateByCompany(res.locals.user.id, companiesByUser, fromDate, toDate));
}));

r.get('/rate/by-client', [
	query('from').optional({ nullable: true, checkFalsy: true }).isDate(),
	query('to').optional({ nullable: true, checkFalsy: true }).isDate(),
	rejectOnFailedValidation(),
], asyncWrapper(async (req, res) => {
	const fromDate = req.query.from ? new Date(req.query.from as string) : undefined;
	const toDate = req.query.to ? new Date(req.query.to as string) : undefined;
	const clientsByUser = await client.findIdsByUser(res.locals.user.id);
	res.json(await stats.rateByClient(res.locals.user.id, clientsByUser, fromDate, toDate));
}));
