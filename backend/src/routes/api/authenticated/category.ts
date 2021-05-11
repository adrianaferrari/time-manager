import { asyncWrapper } from '@cdellacqua/express-async-wrapper';
import { Router } from 'express';
import { param } from 'express-validator';
import { isCategory, rejectOnFailedValidation } from '../../../helpers/validator';
import { HttpError } from '../../../http/error';
import { HttpStatus } from '../../../http/status';
import * as category from '../../../services/category';
import verifyUniquenessMiddleware, { UniqueEntity } from './_uniqueness-middleware';
import verifyOwnershipMiddleware, { OwnedEntity } from './_user-ownership-middleware';

const r: Router = Router();
export default r;

r.put('/:id', [
	param('id').isUUID(),
	...isCategory(),
	rejectOnFailedValidation(),
	verifyOwnershipMiddleware((req) => ({
		[OwnedEntity.category]: req.params.id,
	})),
	verifyUniquenessMiddleware((req) => ({
		[UniqueEntity.category]: { name: req.body.name, id: req.params.id }
	})),
], asyncWrapper(async (req, res) => {
	res.json(await category.update(req.params.id, {
		userId: res.locals.user.id,
		name: req.body.name,
	}));
}));

r.delete('/:id', [
	param('id').isUUID(),
	rejectOnFailedValidation(),
	verifyOwnershipMiddleware((req) => ({
		[OwnedEntity.category]: req.params.id,
	})),
], asyncWrapper(async (req, res) => {
	await category.del(req.params.id);
	res.status(HttpStatus.NoContent).end();
}));

r.get('/', asyncWrapper(async (_, res) => {
	res.json(await category.findAll({ userId: res.locals.user.id }));
}));

r.post('/', [
	...isCategory(),
	rejectOnFailedValidation(),
	verifyUniquenessMiddleware((req) => ({
		[UniqueEntity.category]: { name: req.body.name }
	})),
], asyncWrapper(async (req, res) => {
	res.status(201).json(await category.create({ userId: res.locals.user.id, name: req.body.name }));
}));
