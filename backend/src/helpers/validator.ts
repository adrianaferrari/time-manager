import { RequestHandler } from 'express';
import { query, validationResult } from 'express-validator';
import { HttpError } from '../http/error';
import { HttpStatus } from '../http/status';

export function rejectOnFailedValidation(): RequestHandler {
	return (req, _, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			next(new HttpError(HttpStatus.UnprocessableEntity, errors.array()));
		} else {
			next();
		}
	};
}

export function isAsyncDataTableRequest(allowedKeys: string[]) {
	return [
		query('pageIndex').isInt({ min: 0 }),
		query('recordsPerPage').isInt({ min: 1 }),
		query('orderBy').optional({ nullable: true }).isArray(),
		query('orderBy.*.key').isIn(allowedKeys),
		query('orderBy.*.direction').isIn([ 'asc', 'desc' ]),
		query('query').optional({ nullable: true }).isString(),
	];
}
