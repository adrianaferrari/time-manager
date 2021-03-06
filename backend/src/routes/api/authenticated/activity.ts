import { asyncWrapper } from '@cdellacqua/express-async-wrapper';
import { Router } from 'express';
import { body, param } from 'express-validator';
import config from '../../../config';
import { signUrl } from '../../../crypto/url';
import { define } from '../../../helpers/object';
import {
	isActivity, isActivityFilter, isAsyncDataTableRequest, rejectOnFailedValidation, sanitizeActivity, sanitizeActivityFilter, sanitizeDataTableRequest,
} from '../../../helpers/validator';
import { HttpStatus } from '../../../http/status';
import * as activity from '../../../services/activity';
import verifyOwnershipMiddleware, { OwnedEntity } from './_user-ownership-middleware';

const r: Router = Router();
export default r;

r.put('/:id', [
	param('id').isUUID(),
	...isActivity(),
	...sanitizeActivity(),
	rejectOnFailedValidation(),
	verifyOwnershipMiddleware((req) => (define({
		[OwnedEntity.activity]: req.params.id,
		[OwnedEntity.category]: req.body.categoryId,
		[OwnedEntity.project]: req.body.projectId || undefined,
	}))),
], asyncWrapper(async (req, res) => {
	res.json(await activity.update(req.params.id, {
		userId: res.locals.userId,
		categoryId: req.body.categoryId,
		date: req.body.date,
		description: req.body.description,
		timeSpent: req.body.timeSpent,
		projectId: req.body.projectId,
	}));
}));

r.delete('/:id', [
	param('id').isUUID(),
	rejectOnFailedValidation(),
	verifyOwnershipMiddleware((req) => ({
		[OwnedEntity.activity]: req.params.id,
	})),
], asyncWrapper(async (req, res) => {
	await activity.del(req.params.id);
	res.status(HttpStatus.NoContent).end();
}));

r.get('/:id', [
	param('id').isUUID(),
	rejectOnFailedValidation(),
	verifyOwnershipMiddleware((req) => ({
		[OwnedEntity.activity]: req.params.id,
	})),
], asyncWrapper(async (req, res) => {
	const found = await activity.find(req.params.id);
	res.json({ ...found });
}));

r.post('/csv', [
	body('from').isDate(),
	body('to').isDate(),
	body('clientId').optional({ nullable: true, checkFalsy: true }).isUUID(),
	body('projectId').optional({ nullable: true, checkFalsy: true }).isUUID(),
	body('categoryIds').optional({ nullable: true, checkFalsy: true }).isArray(),
	body('categoryIds.*').isUUID(),
	body('roundTo').isNumeric(),
	rejectOnFailedValidation(),
	verifyOwnershipMiddleware((req, _res) => define({
		[OwnedEntity.project]: req.body.projectId ?? undefined,
		[OwnedEntity.client]: req.body.clientId ?? undefined,
		[OwnedEntity.category]: req.body.categoryIds?.lenght ? req.body.categoryIds : undefined,
	})),
], asyncWrapper(async (req, res) => {
	const queryParams = new URLSearchParams([
		['categoryIds', req.body.categoryIds],
		['roundTo', req.body.roundTo],
	]);
	if (req.body.projectId) {
		queryParams.append('projectId', req.body.projectId);
	}
	if (req.body.clientId) {
		queryParams.append('clientId', req.body.clientId);
	}
	const url = await signUrl(`/api/download/activity/${
		res.locals.user.id
	}/${req.body.from}/${req.body.to}?${queryParams.toString()}`, config.signedUrlExpirationSeconds);
	res.status(201).send(url);
}));

r.get('/', [
	...isAsyncDataTableRequest([
		activity.cols.date,
		'category.name',
		'project.name',
		activity.cols.timeSpent,
		activity.cols.description,
	]),
	...isActivityFilter(),
	...sanitizeDataTableRequest(),
	...sanitizeActivityFilter(),
	rejectOnFailedValidation(),
], asyncWrapper(async (req, res) => {
	const query = req.query as any;
	const filter: activity.FilterActivityRequest = {
		pageIndex: query.pageIndex,
		orderBy: query.orderBy,
		query: query.query,
		recordsPerPage: query.recordsPerPage,
		filters: {
			categoryId: query.categoryId,
			projectId: query.projectId,
			from: query.from,
			to: query.to,
		},
	};
	res.json(await activity.list(res.locals.user.id, filter));
}));

r.post('/', [
	...isActivity(),
	...sanitizeActivity(),
	rejectOnFailedValidation(),
	verifyOwnershipMiddleware((req) => (define({
		[OwnedEntity.category]: req.body.categoryId,
		[OwnedEntity.project]: req.body.projectId || undefined,
	}))),
], asyncWrapper(async (req, res) => {
	res.status(201).json(await activity.create({
		userId: res.locals.user.id,
		categoryId: req.body.categoryId,
		date: req.body.date,
		description: req.body.description,
		timeSpent: req.body.timeSpent,
		projectId: req.body.projectId,
	}));
}));
