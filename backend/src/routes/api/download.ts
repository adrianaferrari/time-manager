import { Router } from 'express';
import stringify from 'csv-stringify';
import { asyncWrapper } from '@cdellacqua/express-async-wrapper';
import { pipeline, Transform } from 'stream';
import BigNumber from 'bignumber.js';
import { DateOnly } from '@cdellacqua/date-only';
import { Interval } from '@cdellacqua/interval';
import { param, query } from 'express-validator';
import { rejectOnFailedValidation } from '../../helpers/validator';
import * as activity from '../../services/activity';
import { verifyUrlMiddleware } from '../../crypto/url';
import { uuid } from '../../types/common';

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

r.get('/activity/:userId/:from/:to', [
	param('userId').isUUID(),
	param('from').isDate(),
	param('to').isDate(),
	query('projectId').optional({ nullable: true, checkFalsy: true }).isUUID(),
	query('categoryIds').optional({ nullable: true, checkFalsy: true }),
	query('roundTo').isNumeric(),
	rejectOnFailedValidation(),
], asyncWrapper(async (req, res, next) => {
	const from = new DateOnly(req.params.from as string);
	const to = new DateOnly(req.params.to as string);
	res.header(
		'Content-Disposition',
		`attachment; filename="${from.toString()}_${to.toString()}.csv"`,
	);
	res.header('Content-Type', 'text/csv; charset=utf-8');
	let categoryIds: uuid[] | undefined;
	if (req.query.categoryIds && typeof req.query.categoryIds === 'string') {
		categoryIds = [req.query.categoryIds];
	} else if (req.query.categoryIds && req.query.categoryIds.length) {
		categoryIds = req.query.categoryIds as uuid[];
	}
	pipeline(
		activity.findStreamFromDateRange(
			req.params.userId,
			from,
			to,
			(req.query.projectId ?? undefined) as uuid | undefined,
			categoryIds,
		),
		new Transform({
			objectMode: true,
			transform(a, _, done) {
				try {
					const hours = new BigNumber(a.timeSpent).dividedBy(3600);
					let effort;
					if (req.query.roundTo === '0.1') {
						effort = hours.toFixed(1, BigNumber.ROUND_HALF_EVEN);
					} else if (req.query.roundTo === '0.01') {
						effort = hours.toFixed(2, BigNumber.ROUND_HALF_EVEN);
					} else if (req.query.roundTo === '1') {
						effort = hours.toFixed(0, BigNumber.ROUND_HALF_EVEN);
					} else if (req.query.roundTo === '0.25') {
						const rounded = hours.decimalPlaces(0, BigNumber.ROUND_HALF_EVEN);
						const decimalPlaces = hours.minus(rounded);
						let decimalRounding = new BigNumber(0);
						if (decimalPlaces.isGreaterThanOrEqualTo(0.125) && decimalPlaces.isLessThan(0.375)) {
							decimalRounding = new BigNumber(0.25);
						} else if (decimalPlaces.isGreaterThanOrEqualTo(0.375) && decimalPlaces.isLessThan(0.625)) {
							decimalRounding = new BigNumber(0.5);
						} else if (decimalPlaces.isGreaterThanOrEqualTo(0.625) && decimalPlaces.isLessThan(0.875)) {
							decimalRounding = new BigNumber(0.75);
						} else if (decimalPlaces.isGreaterThanOrEqualTo(0.875)) {
							decimalRounding = new BigNumber(1);
						}
						effort = rounded.plus(decimalRounding).toString();
					} else if (req.query.roundTo === '0.5') {
						const integerPart = hours.decimalPlaces(0, BigNumber.ROUND_FLOOR);
						const decimalPlaces = hours.minus(integerPart);
						let decimalRounding = new BigNumber(0);
						if (decimalPlaces.isGreaterThanOrEqualTo(0.25) && decimalPlaces.isLessThan(0.75)) {
							decimalRounding = new BigNumber(0.5);
						} else if (decimalPlaces.isGreaterThanOrEqualTo(0.75)) {
							decimalRounding = new BigNumber(1);
						}
						effort = integerPart.plus(decimalRounding).toString();
					} else {
						effort = hours.toString();
					}
					this.push({
						date: a.date,
						effort,
						description: a.description,
						category: a.category,
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
