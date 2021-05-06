import { DateOnly } from '@cdellacqua/date-only';
import { asyncWrapper } from '@cdellacqua/express-async-wrapper';
import { Router } from 'express';
import { query } from 'express-validator';
import { isAsyncDataTableRequest, rejectOnFailedValidation } from '../../../helpers/validator';
import * as activity from '../../../services/activity';

const r: Router = Router();
export default r;

r.get('/', [
	...isAsyncDataTableRequest([ 
		activity.cols.date,
		'category.name',
		'project.name',
		activity.cols.timeSpent,
		activity.cols.description,
	]),
	query('from').optional({ nullable: true }).isDate(),
	query('to').optional({ nullable: true }).isDate(),
	query('projectId').optional({ nullable: true }).isUUID(),
	query('categoryId').optional({ nullable: true }).isUUID(),
	rejectOnFailedValidation()
], asyncWrapper(async (req, res) => {
	const filter: activity.FilterActivityRequest = {
		pageIndex: Number(req.query.pageIndex),
		orderBy: (req.query.orderBy as { key: string, direction: 'asc'|'desc' }[] || []).map(({ key, direction }) => ({ column: key, order: direction })),
		query: req.query.query as string || '',
		recordsPerPage: Number(req.query.recordsPerPage),
		filters: {
			categoryId: req.query.categoryId as string | undefined,
			projectId: req.query.projectId as string | undefined,
			from: req.query.from ? DateOnly.fromString(req.query.from as string) : undefined,
			to: req.query.to ? DateOnly.fromString(req.query.to as string) : undefined,
		}
	};
	res.json(await activity.list(res.locals.user.id, filter));
}));
