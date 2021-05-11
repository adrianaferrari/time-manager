import { SerializableError } from '@cdellacqua/serializable-error';
import jwt from 'jsonwebtoken';
import { asyncWrapper } from '@cdellacqua/express-async-wrapper';
import { HttpError } from '../../../http/error';
import config from '../../../config';
import { find } from '../../../services/user';
import { HttpStatus } from '../../../http/status';
import { uuid } from '../../../types/common';
import { Request, Response } from 'express';
import * as company from '../../../services/company';
import * as category from '../../../services/category';
import * as client from '../../../services/client';
import * as technology from '../../../services/technology';

export enum UniqueEntity {
	category = 'category',
	clientEmail = 'clientEmail',
	companyVat = 'companyVat',
	companyEmail = 'companyEmail',
	technology = 'technology',
}

function verifyUniquenessMiddleware(paramsExtractor: ((req: Request, res: Response) => { [key in UniqueEntity]?: { name: string, id?: uuid } })) {
	return asyncWrapper(async (req, res, next) => {
		const uniquenessRules = paramsExtractor(req, res);
		const userId = res.locals.user.id;
		await Promise.all(Object.keys(uniquenessRules).map((key) => {
			switch (key) {
				case UniqueEntity.category:
					return category.alreadyExists(uniquenessRules[key]!.name, userId, uniquenessRules[key]!.id)
						.then((res) => {
							if (res) {
								throw new HttpError(HttpStatus.Conflict, 'category already exists for this user');
							}
						});
				case UniqueEntity.clientEmail:
					return client.alreadyExists(uniquenessRules[key]!.name, userId, uniquenessRules[key]!.id)
						.then((res) => {
							if (res) {
								throw new HttpError(HttpStatus.Conflict, 'a client with this email already exists');
							}
						});
				case UniqueEntity.companyVat:
					return company.vatNumberAlreadyExists(uniquenessRules[key]!.name, userId, uniquenessRules[key]!.id)
						.then((res) => {
							if (res) {
								throw new HttpError(HttpStatus.Conflict, 'a company with this vat number already exists');
							}
						});
				case UniqueEntity.companyEmail:
					return company.emailAlreadyExists(uniquenessRules[key]!.name, userId, uniquenessRules[key]!.id)
						.then((res) => {
							if (res) {
								throw new HttpError(HttpStatus.Conflict, 'a company with this email already exists');
							}
						});
				case UniqueEntity.technology:
					return technology.alreadyExists(uniquenessRules[key]!.name, userId, uniquenessRules[key]!.id)
						.then((res) => {
							if (res) {
								throw new HttpError(HttpStatus.Conflict, 'technology already exists for this user');
							}
						});
			}
		}));
		next();
	});
}

export default verifyUniquenessMiddleware;
