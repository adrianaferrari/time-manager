import { DateOnly } from '@cdellacqua/date-only';
import { Interval } from '@cdellacqua/interval';
import BigNumber from 'bignumber.js';
import { RequestHandler } from 'express';
import {
	body, query, ValidationChain, validationResult,
} from 'express-validator';
import { HttpError } from '../http/error';
import { HttpStatus } from '../http/status';
import { cols as activityCols } from '../services/activity';
import { cols as paymentCols } from '../services/payment';
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

export function isAsyncDataTableRequest(allowedKeys: string[]): ValidationChain[] {
	return [
		query('pageIndex').isInt({ min: 0 }),
		query('recordsPerPage').isInt({ min: 1 }),
		query('orderBy').optional({ nullable: true, checkFalsy: true }).isArray(),
		query('orderBy.*.key').isIn(allowedKeys),
		query('orderBy.*.direction').isIn(['asc', 'desc']),
		query('query').optional({ nullable: true, checkFalsy: true }).isString(),
	];
}

export function isTechnology(): ValidationChain[] {
	return [
		body('name').isString().isLength({ max: 100 }),
	];
}

export function isCategory(): ValidationChain[] {
	return [
		body('name').isString().isLength({ max: 100 }),
	];
}

export function isProject(): ValidationChain[] {
	return [
		body('name').isString().isLength({ max: 100 }),
		body('startDate').isDate(),
		body('endDate').optional({ nullable: true, checkFalsy: true }).isDate().custom((value, { req }) => {
			if (value && value < req.body.startDate) {
				throw new Error('End date must be equal to or after start date');
			}
			return true;
		}),
		body('clientId').optional({ nullable: true, checkFalsy: true }).isUUID(),
		body('currency').optional({ nullable: true, checkFalsy: true }).isIn(Object.values(Currency)).custom((value, { req }) => {
			if (!value && req.body.price) {
				throw new Error('Currency is required when price is specified');
			}
			return true;
		}),
		body('price').optional({ nullable: true, checkFalsy: true }).isDecimal().custom((value, { req }) => {
			if (!value && req.body.currency) {
				throw new Error('Price is required when currency is specified');
			}
			return true;
		}),
		body('estimatedEffort').optional({ nullable: true, checkFalsy: true }).isString().custom((value) => {
			if (value && !value.match(Interval.regex)) {
				throw new Error('Estimated effort is in an invalid interval format');
			}
			return true;
		}),
		body('technologyIds').optional({ nullable: true, checkFalsy: true }).isArray(),
		body('technologyIds.*').isUUID(),
	];
}

export function sanitizeProject(): ValidationChain[] {
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

export function isActivity(): ValidationChain[] {
	return [
		body('description').isString().isLength({ min: 1, max: 1000 }),
		body('projectId').optional({ nullable: true, checkFalsy: true }).isUUID(),
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

export function isClient(): ValidationChain[] {
	return [
		body('firstName').isString().isLength({ min: 1, max: 100 }),
		body('lastName').isString().isLength({ min: 1, max: 100 }),
		body('email').optional({ nullable: true, checkFalsy: true }).isEmail().isLength({ max: 150 }),
		body('companyId').optional({ nullable: true, checkFalsy: true }).isUUID(),
	];
}

export function isCompany(): ValidationChain[] {
	return [
		body('name').isString().isLength({ min: 1, max: 150 }),
		body('vatNumber').optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 100 }),
		body('email').optional({ nullable: true, checkFalsy: true }).isEmail().isLength({ max: 150 }),
	];
}

export function isPayment(): ValidationChain[] {
	return [
		body('date').isDate(),
		body('amount').isDecimal(),
		body('currency').isIn(Object.values(Currency)),
		body('projectIds').isArray({ min: 1 }),
		body('projectIds.*').isUUID(),
		body('from').optional({ nullable: true, checkFalsy: true }).isDate(),
		body('to').optional({ nullable: true, checkFalsy: true }).isDate(),
	];
}

export function isActivityFilter(): ValidationChain[] {
	return [
		query('from').optional({ nullable: true, checkFalsy: true }).isDate(),
		query('to').optional({ nullable: true, checkFalsy: true }).isDate(),
		query('projectId').optional({ nullable: true, checkFalsy: true }).isUUID(),
		query('categoryId').optional({ nullable: true, checkFalsy: true }).isUUID(),
	];
}

export function isPaymentFilter(): ValidationChain[] {
	return [
		query('from').optional({ nullable: true, checkFalsy: true }).isDate(),
		query('to').optional({ nullable: true, checkFalsy: true }).isDate(),
		query('projectId').optional({ nullable: true, checkFalsy: true }).isUUID(),
	];
}

export function sanitizeActivityFilter(): ValidationChain[] {
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
		query('orderBy').customSanitizer((value) => {
			if (!value || !value.length) {
				return [{ column: activityCols.date, order: 'desc' }, { column: activityCols.createdAt, order: 'desc' }];
			}
			return value;
		}),
	];
}

export function sanitizePaymentFilter(): ValidationChain[] {
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
		query('orderBy').customSanitizer((value) => {
			if (!value || !value.length) {
				return [{ column: paymentCols.date, order: 'desc' }, { column: paymentCols.createdAt, order: 'desc' }];
			}
			return value;
		}),
	];
}

export function sanitizeDataTableRequest(): ValidationChain[] {
	return [
		query('pageIndex').customSanitizer((value) => Number(value)),
		query('recordsPerPage').customSanitizer((value) => Number(value)),
		query('query').customSanitizer((value) => value || ''),
		query('orderBy').customSanitizer((value) => {
			if (value) {
				return value.map(({ key, direction }: any) => ({ column: key, order: direction }));
			}
			return [];
		}),
	];
}

export function sanitizeActivity(): ValidationChain[] {
	return [
		body('date').customSanitizer((value) => DateOnly.fromString(value)),
		body('timeSpent').customSanitizer((value) => new Interval(value)),
		body('projectId').customSanitizer((value) => value || null),
	];
}

export function sanitizeClient(): ValidationChain[] {
	return [
		body('email').customSanitizer((value) => value || null),
		body('companyId').customSanitizer((value) => value || null),
	];
}

export function sanitizeCompany(): ValidationChain[] {
	return [
		body('email').customSanitizer((value) => value || null),
		body('vatNumber').customSanitizer((value) => value || null),
	];
}

export function sanitizePayment(): ValidationChain[] {
	return [
		body('date').customSanitizer((value) => DateOnly.fromString(value)),
		body('amount').customSanitizer((value) => new BigNumber(value)),
		body('from').customSanitizer((value) => value && DateOnly.fromString(value)),
		body('to').customSanitizer((value) => value && DateOnly.fromString(value)),
	];
}

export function isUserSettings(): ValidationChain[] {
	return [
		body('dayLength').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0.5, max: 24 }),
	];
}

export function sanitizeUserSettings(): ValidationChain[] {
	return [
		body('dayLength').customSanitizer((value) => {
			if (!value) { return null; }
			return value;
		}),
	];
}
