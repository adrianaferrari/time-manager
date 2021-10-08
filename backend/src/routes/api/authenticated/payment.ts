import { asyncWrapper } from '@cdellacqua/express-async-wrapper';
import { Router } from 'express';
import { param } from 'express-validator';
import {
	isAsyncDataTableRequest,
	isPayment,
	isPaymentFilter,
	rejectOnFailedValidation,
	sanitizeDataTableRequest,
	sanitizePayment,
	sanitizePaymentFilter,
} from '../../../helpers/validator';
import verifyOwnershipMiddleware, { OwnedEntity } from './_user-ownership-middleware';
import * as payment from '../../../services/payment';
import * as project from '../../../services/project';
import { HttpStatus } from '../../../http/status';
import { HttpError } from '../../../http/error';

const r: Router = Router();
export default r;

r.get('/', [
	...isAsyncDataTableRequest([
		payment.cols.date,
		'project.name',
		payment.cols.amount,
		payment.cols.currency,
	]),
	...isPaymentFilter(),
	...sanitizeDataTableRequest(),
	...sanitizePaymentFilter(),
	rejectOnFailedValidation(),
], asyncWrapper(async (req, res) => {
	const query = req.query as any;
	const filter: payment.FilterPaymentRequest = {
		pageIndex: query.pageIndex,
		orderBy: query.orderBy,
		query: query.query,
		recordsPerPage: query.recordsPerPage,
		filters: {
			projectId: query.projectId,
			from: query.from,
			to: query.to,
		},
	};
	res.json(await payment.list(res.locals.user.id, filter));
}));

r.post('/', [
	...isPayment(),
	...sanitizePayment(),
	rejectOnFailedValidation(),
], asyncWrapper(async (req, res) => {
	if (req.body.projectIds.length === 1) {
		res.status(201).json([await payment.create({
			amount: req.body.amount,
			currency: req.body.currency,
			date: req.body.date,
			projectId: req.body.projectIds[0],
		})]);
	} else {
		res.status(201).json(await payment.split(undefined, res.locals.user.id, {
			amount: req.body.amount,
			currency: req.body.currency,
			date: req.body.date,
			projectIds: req.body.projectIds,
			from: req.body.from,
			to: req.body.to,
		}));
	}
}));

r.use('/:id', asyncWrapper(async (req, res, next) => {
	const paymentEntity = await payment.find({ id: req.params.id });
	if (!paymentEntity) {
		throw new HttpError(HttpStatus.NotFound, 'payment does not exist');
	}
	const projectEntity = await project.find({ id: paymentEntity.projectId });
	if (projectEntity?.userId !== res.locals.user.id) {
		throw new HttpError(HttpStatus.Forbidden, 'payment does not belong to user');
	}
	res.locals.project = projectEntity;
	res.locals.payment = paymentEntity;
	next();
}));

r.put('/:id', [
	param('id').isUUID(),
	...isPayment(),
	...sanitizePayment(),
	rejectOnFailedValidation(),
	verifyOwnershipMiddleware((req) => ({
		[OwnedEntity.payment]: req.params.id,
	})),
], asyncWrapper(async (req, res) => {
	if (req.body.projectIds.length === 1) {
		res.json([await payment.update(req.params.id, {
			amount: req.body.amount,
			currency: req.body.currency,
			date: req.body.date,
			projectId: req.body.projectIds[0],
		})]);
	} else {
		res.json(await payment.split(req.params.id, res.locals.user.id, {
			amount: req.body.amount,
			currency: req.body.currency,
			date: req.body.date,
			projectIds: req.body.projectIds,
			from: req.body.from,
			to: req.body.to,
		}));
	}
}));

r.delete('/:id', [
	param('id').isUUID(),
	rejectOnFailedValidation(),
	verifyOwnershipMiddleware((req) => ({
		[OwnedEntity.payment]: req.params.id,
	})),
], asyncWrapper(async (req, res) => {
	await payment.del(req.params.id);
	res.status(HttpStatus.NoContent).end();
}));

r.get('/:id', [
	param('id').isUUID(),
	rejectOnFailedValidation(),
	verifyOwnershipMiddleware((req) => ({
		[OwnedEntity.payment]: req.params.id,
	})),
], asyncWrapper(async (req, res) => {
	const found = await payment.find(req.params.id);
	res.json({ ...found });
}));
