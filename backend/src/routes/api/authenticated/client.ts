import { asyncWrapper } from '@cdellacqua/express-async-wrapper';
import { Router } from 'express';
import { isClient, rejectOnFailedValidation, sanitizeClient } from '../../../helpers/validator';
import * as company from '../../../services/company';
import * as client from '../../../services/client';
import { HttpError } from '../../../http/error';
import { HttpStatus } from '../../../http/status';
import verifyOwnershipMiddleware, { OwnedEntity } from './_user-ownership-middleware';
import { define } from '../../../helpers/object';
import { param } from 'express-validator';
import verifyUniquenessMiddleware, { UniqueEntity } from './_uniqueness-middleware';

const r: Router = Router();
export default r;

r.put('/:id', [
	param('id').isUUID(),
	...isClient(),
	...sanitizeClient(),
	rejectOnFailedValidation(),
	verifyOwnershipMiddleware((req) => define({
		[OwnedEntity.company]: req.body.companyId,
		[OwnedEntity.client]: req.params.id,
	})),
	verifyUniquenessMiddleware((req) => (req.body.email ? {
		[UniqueEntity.clientEmail]: { name: req.body.email, id: req.params.id },
	} : {})),
], asyncWrapper(async (req, res) => {
	res.json(await client.update(req.params.id, { 
		userId: res.locals.user.id,
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		companyId: req.body.companyId,
		email: req.body.email,
	}));
}));

r.post('/', [
	...isClient(),
	...sanitizeClient(),
	rejectOnFailedValidation(),
	verifyOwnershipMiddleware((req) => define({
		[OwnedEntity.company]: req.body.companyId
	})),	
	verifyUniquenessMiddleware((req) => (req.body.email ? {
		[UniqueEntity.clientEmail]: { name: req.body.email },
	} : {})),
], asyncWrapper(async (req, res) => {
	res.status(201).json(await client.create({
		userId: res.locals.user.id,
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		companyId: req.body.companyId,
		email: req.body.email,
	}));
}));

