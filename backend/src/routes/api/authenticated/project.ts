import { asyncWrapper } from '@cdellacqua/express-async-wrapper';
import { Router } from 'express';
import { param } from 'express-validator';
import {
	isAsyncDataTableRequest, isProject, rejectOnFailedValidation, sanitizeDataTableRequest, sanitizeProject, isPaymentFilter, sanitizePaymentFilter,
} from '../../../helpers/validator';
import * as project from '../../../services/project';
import * as activity from '../../../services/activity';
import * as payment from '../../../services/payment';
import verifyOwnershipMiddleware, { OwnedEntity } from './_user-ownership-middleware';
import paymentRoutes from './payment';
import { HttpError } from '../../../http/error';
import { HttpStatus } from '../../../http/status';
import { define } from '../../../helpers/object';

const r: Router = Router();
export default r;

r.use('/:id', asyncWrapper(async (req, res, next) => {
	const projectEntity = await project.find({ id: req.params.id });
	if (!projectEntity) {
		throw new HttpError(HttpStatus.NotFound, 'project does not exist');
	}
	if (projectEntity.userId !== res.locals.user.id) {
		throw new HttpError(HttpStatus.Forbidden, 'project does not belong to user');
	}
	res.locals.project = projectEntity;
	next();
}));

r.put('/:id', [
	param('id').isUUID(),
	...isProject(),
	...sanitizeProject(),
	rejectOnFailedValidation(),
	verifyOwnershipMiddleware((req) => define({
		[OwnedEntity.client]: req.body.clientId || undefined,
		[OwnedEntity.technologies]: req.body.technologyIds,
		[OwnedEntity.project]: req.params.id,
	})),
], asyncWrapper(async (req, res) => {
	res.json(await project.update(req.params.id, {
		userId: res.locals.user.id,
		name: req.body.name,
		startDate: req.body.startDate,
		endDate: req.body.endDate,
		clientId: req.body.clientId,
		currency: req.body.currency,
		estimatedEffort: req.body.estimatedEffort,
		price: req.body.price,
		technologyIds: req.body.technologyIds,
	}));
}));

r.delete('/:id', [
	param('id').isUUID(),
	rejectOnFailedValidation(),
	verifyOwnershipMiddleware((req) => ({
		[OwnedEntity.project]: req.params.id,
	})),
], asyncWrapper(async (req, res) => {
	await project.del(req.params.id);
	res.status(HttpStatus.NoContent).end();
}));

r.get('/:id', [
	param('id').isUUID(),
	rejectOnFailedValidation(),
	verifyOwnershipMiddleware((req) => ({
		[OwnedEntity.project]: req.params.id,
	})),
], asyncWrapper(async (req, res) => {
	const found = await project.find(req.params.id);
	const activities = await activity.findAll({ [activity.cols.projectId]: req.params.id }, [{ column: activity.cols.date, order: 'desc' }]);
	const timeSpent = await activity.timeSpentByFilter(res.locals.user.id, { [activity.cols.projectId]: req.params.id });
	const timeSpentByCategory = await activity.timeSpentByFilterGrouped(
		res.locals.user.id,
		{ [activity.cols.projectId]: req.params.id },
		undefined,
		undefined,
		activity.cols.categoryId,
	);
	const payments = await payment.findAll({ [payment.cols.projectId]: req.params.id });
	res.json({
		...found, activities, timeSpent, payments, timeSpentByCategory,
	});
}));

r.get('/', asyncWrapper(async (_, res) => {
	res.json(await project.findAll(
		{ userId: res.locals.user.id },
		[{ column: project.cols.startDate, order: 'desc' }, { column: project.cols.createdAt, order: 'desc' }],
	));
}));

r.post('/', [
	...isProject(),
	...sanitizeProject(),
	rejectOnFailedValidation(),
	verifyOwnershipMiddleware((req) => define({
		[OwnedEntity.client]: req.body.clientId || undefined,
		[OwnedEntity.technologies]: req.body.technologyIds,
	})),
], asyncWrapper(async (req, res) => {
	res.status(201).json(await project.create({
		userId: res.locals.user.id,
		name: req.body.name,
		startDate: req.body.startDate,
		endDate: req.body.endDate,
		clientId: req.body.clientId,
		currency: req.body.currency,
		estimatedEffort: req.body.estimatedEffort,
		price: req.body.price,
		technologyIds: req.body.technologyIds,
	}));
}));
