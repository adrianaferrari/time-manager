import { Router } from 'express';
import stringify from 'csv-stringify';
import { asyncWrapper } from '@cdellacqua/express-async-wrapper';
import { pipeline, Transform } from 'stream';
import BigNumber from 'bignumber.js';
import { DateOnly } from '@cdellacqua/date-only';
import { Interval } from '@cdellacqua/interval';
import { param } from 'express-validator';
import { rejectOnFailedValidation } from '../../helpers/validator';
import * as activity from '../../services/activity';
import { verifyUrlMiddleware } from '../../crypto/url';

const r: Router = Router();
export default r;

r.use(verifyUrlMiddleware());

function streamCsv() {
	return stringify({
		bom: true,
		delimiter: ';',
		header: true,
		cast: {
			boolean: (bool) => (bool ? 'yes' : 'no'),
			date: (date) => date.toISOString().split('T')[0],
			object: (obj) => {
				if (obj instanceof BigNumber || obj instanceof DateOnly) {
					return obj.toString();
				}
				if (obj instanceof Interval) {
					return (obj.totalSeconds / 3600).toFixed(2);
				}
				return JSON.stringify(obj);
			},
		},
	});
}

r.get('/activity/:userId/:from/:to/:projectId', [
	param('userId').isUUID(),
	param('from').isDate(),
	param('to').isDate(),
	param('projectId').optional({ nullable: true, checkFalsy: true }).isUUID(),
	rejectOnFailedValidation(),
], asyncWrapper(async (req, res, next) => {
	const from = new DateOnly(req.params.from as string);
	const to = new DateOnly(req.params.to as string);
	res.header(
		'Content-Disposition',
		`attachment; filename="${from.toString()}_${to.toString()}${req.params.projectId ? `_${req.params.projectId}` : ''}.csv"`,
	);
	res.header('Content-Type', 'text/csv; charset=utf-8');
	pipeline(
		activity.findStreamFromDateRange(
			req.params.userId,
			from,
			to,
			(req.params.projectId ?? undefined) as string | undefined,
		),
		new Transform({
			objectMode: true,
			transform(a, _, done) {
				try {
					this.push({
						date: a.date,
						effort: a.timeSpent,
						description: a.description,
					});
					done();
				} catch (err) {
					done(err);
				}
			},
		}),
		streamCsv(),
		(err) => err && next(err),
	).pipe(res, { end: true }).on('error', (err) => next(err));
}));
