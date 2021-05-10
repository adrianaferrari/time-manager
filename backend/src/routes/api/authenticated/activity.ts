import { asyncWrapper } from '@cdellacqua/express-async-wrapper';
import { Router } from 'express';
import { param } from 'express-validator';
import { define } from '../../../helpers/object';
import { isActivity, isActivityFilter, isAsyncDataTableRequest, rejectOnFailedValidation, sanitizeActivity, sanitizeActivityFilter, sanitizeDataTableRequest } from '../../../helpers/validator';
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
		[OwnedEntity.project]: req.body.projectId || undefined
	})))
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
	rejectOnFailedValidation()
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
		}
	};
	res.json(await activity.list(res.locals.user.id, filter));
}));

r.post('/', [
	...isActivity(),
	...sanitizeActivity(),
	rejectOnFailedValidation(),
	verifyOwnershipMiddleware((req) => (define({
		[OwnedEntity.category]: req.body.categoryId,
		[OwnedEntity.project]: req.body.projectId || undefined
	})))
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

