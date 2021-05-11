import { asyncWrapper } from '@cdellacqua/express-async-wrapper';
import { Router } from 'express';
import { param } from 'express-validator';
import { isTechnology, rejectOnFailedValidation } from '../../../helpers/validator';
import { HttpStatus } from '../../../http/status';
import * as technology from '../../../services/technology';
import verifyUniquenessMiddleware, { UniqueEntity } from './_uniqueness-middleware';
import verifyOwnershipMiddleware, { OwnedEntity } from './_user-ownership-middleware';

const r: Router = Router();
export default r;

r.put('/:id', [
	param('id').isUUID(),
	...isTechnology(),
	rejectOnFailedValidation(),
	verifyOwnershipMiddleware((req) => ({
		[OwnedEntity.technology]: req.params.id,
	})),
	verifyUniquenessMiddleware((req) => ({
		[UniqueEntity.technology]: { name: req.body.name, id: req.params.id },
	})),
], asyncWrapper(async (req, res) => {
	res.json(await technology.update(req.params.id, { userId: res.locals.user.id, name: req.body.name }));
}));

r.delete('/:id', [
	param('id').isUUID(),
	rejectOnFailedValidation(),
	verifyOwnershipMiddleware((req) => ({
		[OwnedEntity.technology]: req.params.id,
	})),
], asyncWrapper(async (req, res) => {
	await technology.del(req.params.id);
	res.status(HttpStatus.NoContent).end();
}));

r.get('/', asyncWrapper(async (_, res) => {
	res.json(await technology.findAll({ userId: res.locals.user.id }, [{ column: technology.cols.name, order: 'asc' }]));
}));

r.post('/', [
	...isTechnology(),
	rejectOnFailedValidation(),
	verifyUniquenessMiddleware((req) => ({
		[UniqueEntity.technology]: { name: req.body.name },
	})),
], asyncWrapper(async (req, res) => {
	res.json(await technology.create({ userId: res.locals.user.id, name: req.body.name }));
}));
