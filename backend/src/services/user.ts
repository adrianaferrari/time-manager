import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Transaction } from 'knex';
import { transact } from '@cdellacqua/knex-transact';
import config from '../config';
import {
	fromQueryGenerator, findOneGenerator, insertGetId, findAllGenerator,
} from '../db/utils';
import { uuid } from '../types/common';

export enum Role {
	user = 'user',
	manager = 'manager',
	admin = 'admin',
};

export const table = 'user';

export const cols = {
	id: 'id',
	email: 'email',
	passwordHash: 'passwordHash',
	enabled: 'enabled',
	minJwtIat: 'minJwtIat',
	createdAt: 'createdAt',
};

export const rolesTable = 'userRole';

export const rolesCols = {
	id: 'id',
	userId: 'userId',
	role: 'role',
};

const columnNames = Object.values(cols);

const rolesColNames = Object.values(rolesCols);

export function createJwt(user: User): string {
	const token = jwt.sign({}, config.secret, {
		expiresIn: config.authentication.tokenExpirationSeconds,
		subject: user.id,
	});
	return token;
}

export function generateAuthResponse(user: User): AuthResponse {
	return {
		jwt: createJwt(user),
		user: {
			createdAt: user.createdAt,
			email: user.email,
			enabled: user.enabled,
			id: user.id,
			minJwtIat: user.minJwtIat,
			roles: user.roles,
		},
	};
}

async function rowMapper(row: UserRaw, trx?: Transaction): Promise<User> {
	return Promise.resolve({
		...row,
		roles: await findAllRoles({ userId: row.id }, undefined, trx),
	});
}

export const find = findOneGenerator(table, columnNames, (row) => rowMapper(row));

export const findAllRoles = findAllGenerator<Record<string, any> | string | number, Role>(rolesTable, rolesColNames, (row) => row.role);

export const fromQuery = fromQueryGenerator<User>(columnNames, (row) => rowMapper(row));

export function create(user: SaveUser, trx?: Transaction): Promise<User> {
	return transact([
		async (db) => insertGetId(db(table)
			.insert({
				[cols.email]: user.email.toLowerCase(),
				[cols.passwordHash]: await bcrypt.hash(user.password, 10),
				[cols.enabled]: user.enabled,
				[cols.minJwtIat]: user.minJwtIat || new Date(),
			})),
		async (db, userId) => {
			await db(rolesTable)
				.insert(user.roles.map((role) => ({ userId, role })));
			return userId;
		},
		(db, id) => find(id, db),
	], trx);
}

export function update(id: uuid, user: Partial<SaveUser>, trx?: Transaction): Promise<User> {
	return transact([
		async (db) => db(table)
			.where({ id })
			.update({
				[cols.email]: user.email?.toLowerCase(),
				[cols.passwordHash]: user.password && await bcrypt.hash(user.password, 10),
				[cols.enabled]: user.enabled,
				[cols.minJwtIat]: user.minJwtIat,
			}),
		(db) => find(id, db),
	], trx);
}

export function del(id: uuid, trx?: Transaction): Promise <void> {
	return transact(
		(db) => db(table).where({ [cols.id]: id }).delete(),
		trx,
	);
}

export async function login({ email, password }: LoginParams): Promise<AuthResponse | null> {
	const user = await find({
		[cols.email]: email.toLowerCase(),
		[cols.enabled]: true,
	});
	if (!user) {
		return null;
	}
	const passwordMatches = await bcrypt.compare(password, user.passwordHash);
	if (!passwordMatches) {
		return null;
	}
	return generateAuthResponse(user);
}

export interface LoginParams {
	email: string,
	password: string,
}

export interface User {
	id: uuid,
	email: string,
	passwordHash: string,
	enabled: boolean,
	minJwtIat: Date,
	createdAt: Date,
	roles: Role[],
}

export interface UserRaw {
	id: uuid,
	email: string,
	passwordHash: string,
	enabled: boolean,
	minJwtIat: Date,
	createdAt: Date,
}

export interface SaveUser {
	email: string,
	password: string,
	enabled: boolean,
	minJwtIat?: Date,
	roles: Role[],
}

export interface AuthResponse {
	jwt: string,
	user: Omit<User, 'passwordHash'>,
}
