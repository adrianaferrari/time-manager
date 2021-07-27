import { asyncWrapper } from '@cdellacqua/express-async-wrapper';
import { Router } from 'express';
import { param } from 'express-validator';
import {
	isCompany, rejectOnFailedValidation, sanitizeCompany,
} from '../../../helpers/validator';
import * as company from '../../../services/company';
import * as client from '../../../services/client';
import * as project from '../../../services/project';
import verifyOwnershipMiddleware, { OwnedEntity } from './_user-ownership-middleware';
import { define } from '../../../helpers/object';
import verifyUniquenessMiddleware, { UniqueEntity } from './_uniqueness-middleware';
import { uuid } from '../../../types/common';
import { HttpStatus } from '../../../http/status';

const r: Router = Router();
export default r;

r.put('/:id', [
	param('id').isUUID(),
	...isCompany(),
	...sanitizeCompany(),
	rejectOnFailedValidation(),
	verifyOwnershipMiddleware((req) => define({
		[OwnedEntity.company]: req.params.id,
	})),
	verifyUniquenessMiddleware((req) => {
		const checkUniqueness = {} as { [key in UniqueEntity]?: { name: string, id?: uuid } };
		if (req.body.email) {
			checkUniqueness[UniqueEntity.companyEmail] = { name: req.body.email, id: req.params.id };
		}
		if (req.body.vatNumber) {
			checkUniqueness[UniqueEntity.companyVat] = { name: req.body.vatNumber, id: req.params.id };
		}
		return checkUniqueness;
	}),
], asyncWrapper(async (req, res) => {
	res.json(await company.update(req.params.id, {
		userId: res.locals.user.id,
		name: req.body.name,
		email: req.body.email,
		vatNumber: req.body.vatNumber,
	}));
}));

r.delete('/:id', [
	param('id').isUUID(),
	rejectOnFailedValidation(),
	verifyOwnershipMiddleware((req) => ({
		[OwnedEntity.company]: req.params.id,
	})),
], asyncWrapper(async (req, res) => {
	await company.del(req.params.id);
	res.status(HttpStatus.NoContent).end();
}));

r.get('/:id', [
	param('id').isUUID(),
	rejectOnFailedValidation(),
	verifyOwnershipMiddleware((req) => ({
		[OwnedEntity.company]: req.params.id,
	})),
], asyncWrapper(async (req, res) => {
	const found = await company.find(req.params.id);
	const clientIds = await client.findIdsByCompany(req.params.id);
	const projectIds = await project.findIdsByClients(clientIds);
	res.json({ ...found, clientIds, projectIds });
}));

r.get('/', asyncWrapper(async (_, res) => {
	res.json(await company.findAll({ userId: res.locals.user.id }));
}));

r.post('/', [
	...isCompany(),
	...sanitizeCompany(),
	rejectOnFailedValidation(),
	verifyUniquenessMiddleware((req) => {
		const checkUniqueness = {} as { [key in UniqueEntity]?: { name: string, id?: uuid } };
		if (req.body.email) {
			checkUniqueness[UniqueEntity.companyEmail] = { name: req.body.email };
		}
		if (req.body.vatNumber) {
			checkUniqueness[UniqueEntity.companyVat] = { name: req.body.vatNumber };
		}
		return checkUniqueness;
	}),
], asyncWrapper(async (req, res) => {
	res.status(201).json(await company.create({
		userId: res.locals.user.id,
		name: req.body.name,
		vatNumber: req.body.vatNumber,
		email: req.body.email,
	}));
}));
