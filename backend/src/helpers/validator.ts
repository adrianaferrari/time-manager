import { DateOnly } from '@cdellacqua/date-only';
import { Interval } from '@cdellacqua/interval';
import BigNumber from 'bignumber.js';
import { RequestHandler } from 'express';
import { body, query, validationResult } from 'express-validator';
import { HttpError } from '../http/error';
import { HttpStatus } from '../http/status';
import { Currency } from '../types/common';

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
		query('orderBy.*.direction').isIn(['asc', 'desc']),
		query('query').optional({ nullable: true }).isString(),
	];
}

export function isTechnology() {
	return [
		body('name').isString().isLength({ max: 100 }),
	];
}

export function isCategory() {
	return [
		body('name').isString().isLength({ max: 100 }),
	];
}

export function isProject() {
	return [
		body('name').isString().isLength({ max: 100 }),
		body('startDate').isDate(),
		body('endDate').optional({ nullable: true }).isDate().custom((value, { req }) => {
			if (value && value < req.body.startDate) {
				throw new Error('End date must be equal to or after start date');
			}
			return true;
		}),
		body('clientId').optional({ nullable: true }).isUUID(),
		body('currency').optional({ nullable: true }).isIn(Object.values(Currency)).custom((value, { req }) => {
			if (!value && req.body.price) {
				throw new Error('Currency is required when price is specified');
			}
			return true;
		}),
		body('price').optional({ nullable: true }).isDecimal().custom((value, { req }) => {
			if (!value && req.body.currency) {
				throw new Error('Price is required when currency is specified');
			}
			return true;
		}),
		body('estimatedEffort').optional({ nullable: true }).isString().custom((value) => {
			if (value && !value.match(Interval.regex)) {
				throw new Error('Estimated effort is in an invalid interval format');
			}
			return true;
		}),
		body('technologyIds').optional({ nullable: true }).isArray(),
		body('technologyIds.*').isUUID(),
	];
}

export function sanitizeProject() {
	return [
		body('price').customSanitizer((value) => {
			if (value) {
				return new BigNumber(value);
			}
			return null;
		}),
		body('estimatedEffort').customSanitizer((value) => {
			if (value) {
				return new Interval(value);
			}
			return null;
		}),
		body('startDate').customSanitizer((value) => DateOnly.fromString(value)),
		body('endDate').customSanitizer((value) => {
			if (value) {
				return DateOnly.fromString(value);
			}
			return null;
		}),
		body('technologyIds').toArray(),
	];
}

export function isActivity() {
	return [
		body('description').isString().isLength({ min: 1, max: 1000 }),
		body('projectId').optional({ nullable: true }).isUUID(),
		body('categoryId').isUUID(),
		body('date').isDate(),
		body('timeSpent').isString().custom((value) => {
			if (!value.match(Interval.regex)) {
				throw new Error('Time spent is in an invalid interval format');
			}
			return true;
		}),
	];
}

export function isClient() {
	return [
		body('firstName').isString().isLength({ min: 1, max: 100 }),
		body('lastName').isString().isLength({ min: 1, max: 100 }),
		body('email').optional({ nullable: true }).isEmail().isLength({ max: 150 }),
		body('companyId').optional({ nullable: true }).isUUID(),
	];
}

export function isCompany() {
	return [
		body('name').isString().isLength({ min: 1, max: 150 }),
		body('vatNumber').optional({ nullable: true }).isString(),
		body('email').optional({ nullable: true }).isEmail().isLength({ max: 150 }),
	];
}

export function isPayment() {
	return [
		body('date').isDate(),
		body('amount').isDecimal(),
		body('currency').isIn(Object.values(Currency)),
		body('projectId').isUUID(),
	];
}

export function isActivityFilter() {
	return [
		query('from').optional({ nullable: true }).isDate(),
		query('to').optional({ nullable: true }).isDate(),
		query('projectId').optional({ nullable: true }).isUUID(),
		query('categoryId').optional({ nullable: true }).isUUID(),
	];
}

export function sanitizeActivityFilter() {
	return [
		query('from').customSanitizer((value) => {
			if (value) {
				return DateOnly.fromString(value);
			}
			return undefined;
		}),
		query('to').customSanitizer((value) => {
			if (value) {
				return DateOnly.fromString(value);
			}
			return undefined;
		}),
	]
}

export function sanitizeDataTableRequest() {
	return [
		query('pageIndex').customSanitizer((value) => Number(value)),
		query('recordsPerPage').customSanitizer((value) => Number(value)),
		query('query').customSanitizer((value) => value || ''),
		query('orderBy').customSanitizer((value) => {
			if (value) {
				return value.map(({ key, direction }: any) => ({ column: key, order: direction }))
			}
			return [];
		}),
	];
}

export function sanitizeActivity() {
	return [
		body('date').customSanitizer((value) => DateOnly.fromString(value)),
		body('timeSpent').customSanitizer((value) => new Interval(value)),
		body('projectId').customSanitizer((value) => value || null),
	];
}

export function sanitizeClient() {
	return [
		body('email').customSanitizer((value) => value || null),
		body('companyId').customSanitizer((value) => value || null),
	];
}

export function sanitizeCompany() {
	return [
		body('email').customSanitizer((value) => value || null),
		body('vatNumber').customSanitizer((value) => value || null),
	];
}

export function sanitizePayment() {
	return [
		body('date').customSanitizer((value) => DateOnly.fromString(value)),
		body('amount').customSanitizer((value) => new BigNumber(value)),
	]
}
