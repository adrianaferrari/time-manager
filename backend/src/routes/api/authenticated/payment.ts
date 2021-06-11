import { asyncWrapper } from '@cdellacqua/express-async-wrapper';
import { Router } from 'express';
import { param } from 'express-validator';
import { isPayment, rejectOnFailedValidation, sanitizePayment } from '../../../helpers/validator';
import verifyOwnershipMiddleware, { OwnedEntity } from './_user-ownership-middleware';
import * as payment from '../../../services/payment';
import { HttpStatus } from '../../../http/status';

const r: Router = Router();
export default r;

r.put('/:id', [
	param('id').isUUID(),
	...isPayment(),
	...sanitizePayment(),
	rejectOnFailedValidation(),
	verifyOwnershipMiddleware((req) => ({
		[OwnedEntity.payment]: req.params.id,
	})),
], asyncWrapper(async (req, res) => {
	console.log(res.locals.project.id)
	res.json(await payment.update(req.params.id, {
		amount: req.body.amount,
		currency: req.body.currency,
		date: req.body.date,
		projectId: res.locals.project.id,
	}));
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

r.post('/', [
	...isPayment(),
	...sanitizePayment(),
	rejectOnFailedValidation(),
], asyncWrapper(async (req, res) => {
	res.status(201).json(await payment.create({
		amount: req.body.amount,
		currency: req.body.currency,
		date: req.body.date,
		projectId: res.locals.project.id,
	}));
}));
