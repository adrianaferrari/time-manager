/* eslint-disable no-shadow */
import { asyncWrapper } from '@cdellacqua/express-async-wrapper';
import { Request, Response } from 'express';
import { HttpError } from '../../../http/error';
import { HttpStatus } from '../../../http/status';
import { uuid } from '../../../types/common';
import * as activity from '../../../services/activity';
import * as category from '../../../services/category';
import * as project from '../../../services/project';
import * as company from '../../../services/company';
import * as client from '../../../services/client';
import * as payment from '../../../services/payment';
import * as technology from '../../../services/technology';
import { SerializableError } from '@cdellacqua/serializable-error';

export enum OwnedEntity {
	activity = 'activityId',
	category = 'categoryId',
	client = 'clientId',
	company = 'companyId',
	payment = 'paymentId',
	project = 'projectId',
	technology = 'technologyId',
	technologies = 'technologyIds',
}

function verifyOwnershipMiddleware(paramsExtractor: ((req: Request, res: Response) => { [key in OwnedEntity]?: uuid | uuid[] })) {
	return asyncWrapper(async (req, res, next) => {
		const ownerships = paramsExtractor(req, res);
		const userId = res.locals.user.id;
		await Promise.all(Object.keys(ownerships).map((key) => {
			switch (key) {
				case OwnedEntity.activity:
					return activity.isOwned(ownerships[key]! as uuid, userId)
						.then((res) => {
							if (!res) {
								throw new HttpError(HttpStatus.Forbidden, 'activity is not owned by this user');
							}
						});
				case OwnedEntity.category:
					if (typeof ownerships[key] !== 'string') {
						return category.areOwned(ownerships[key]! as uuid[], userId)
							.then((res) => {
								if (!res) {
									throw new HttpError(HttpStatus.Forbidden, 'some categories are not owned by this user');
								}
							});
					}
					return category.isOwned(ownerships[key]! as uuid, userId)
						.then((res) => {
							if (!res) {
								throw new HttpError(HttpStatus.Forbidden, 'category is not owned by this user');
							}
						});
				case OwnedEntity.client:
					return client.isOwned(ownerships[key]! as uuid, userId)
						.then((res) => {
							if (!res) {
								throw new HttpError(HttpStatus.Forbidden, 'client is not owned by this user');
							}
						});
				case OwnedEntity.company:
					return company.isOwned(ownerships[key]! as uuid, userId)
						.then((res) => {
							if (!res) {
								throw new HttpError(HttpStatus.Forbidden, 'company is not owned by this user');
							}
						});
				case OwnedEntity.payment:
					return payment.isOwned(ownerships[key]! as uuid, userId)
						.then((res) => {
							if (!res) {
								throw new HttpError(HttpStatus.Forbidden, 'payment is not owned by this user');
							}
						});
				case OwnedEntity.project:
					return project.isOwned(ownerships[key]! as uuid, userId)
						.then((res) => {
							if (!res) {
								throw new HttpError(HttpStatus.Forbidden, 'project is not owned by this user');
							}
						});
				case OwnedEntity.technologies:
					return technology.areOwned(ownerships[key]! as uuid[], userId)
						.then((res) => {
							if (!res) {
								throw new HttpError(HttpStatus.Forbidden, 'some technologies are not owned by this user');
							}
						});
				case OwnedEntity.technology:
					return technology.isOwned(ownerships[key]! as uuid, userId)
						.then((res) => {
							if (!res) {
								throw new HttpError(HttpStatus.Forbidden, 'technology is not owned by this user');
							}
						});
				default:
					throw new SerializableError('unknown entity');
			}
		}));
		next();
	});
}

export default verifyOwnershipMiddleware;
