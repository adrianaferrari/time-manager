import { Interval } from '@cdellacqua/interval';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { axiosExtract } from '../helpers/axios';
import { Currency } from '../helpers/currency';

export function getPaymentByMonth(): Promise<{
	data: ({ month: number } & { [key in Currency]?: BigNumber })[],
	avgByMonth: ({ month: number } & { [key in Currency]?: BigNumber })[],
	avg: { [key in Currency]?: BigNumber },
	currencies: Currency[] }> {
	return axiosExtract<{
			data:({ month: number } & { [key in Currency]?: string })[],
			avgByMonth:({ month: number } & { [key in Currency]?: string })[],
			avg: { [key in Currency]?: string },
			currencies: Currency[]
				}>(axios.get('/auth/stats/payment/by-month'))
		.then((res) => ({
			currencies: res.currencies,
			data: res.data.map((el) => {
				const mapped = { month: el.month };
				Object.keys(Currency).forEach((key) => {
					if (el[key]) {
						mapped[key] = new BigNumber(el[key]);
					}
				});
				return mapped;
			}),
			avgByMonth: res.avgByMonth.map((el) => {
				const mapped = { month: el.month };
				Object.keys(Currency).forEach((key) => {
					if (el[key]) {
						mapped[key] = new BigNumber(el[key]);
					}
				});
				return mapped;
			}),
			avg: Object.keys(res.avg).reduce((acc, key) => {
				acc[key] = new BigNumber(res.avg[key]);
				return acc;
			}, {}),
		}));
}

export function getPaymentByYear(): Promise<{
	data: ({ year: number } & { [key in Currency]?: BigNumber})[],
	currencies: Currency[],
	years: number[]
}> {
	return axiosExtract<{
		data:({ year: number } & { [key in Currency]?: string })[],
		currencies: Currency[],
		years: number[]
			}>(axios.get('/auth/stats/payment/by-year'))
		.then((res) => ({
			data: res.data.map((el) => {
				const mapped = { year: el.year };
				Object.keys(Currency).forEach((key) => {
					if (el[key]) {
						mapped[key] = new BigNumber(el[key]);
					}
				});
				return mapped;
			}),
			currencies: res.currencies,
			years: res.years,
		}));
}

export function getPaymentByClient(): Promise<{
	data: ({ clientId: string } & { [key in Currency]?: BigNumber })[],
	currencies: Currency[],
	clientIds: string[]
}> {
	return axiosExtract<{ data:({ clientId: string } & { [key in Currency]?: string })[], currencies: Currency[], clientIds: string[] }>(
		axios.get('/auth/stats/payment/by-client'))
		.then((res) => ({
			currencies: res.currencies,
			clientIds: res.clientIds,
			data: res.data.map((el) => {
				const mapped = { clientId: el.clientId };
				Object.keys(Currency).forEach((key) => {
					if (el[key]) {
						mapped[key] = new BigNumber(el[key]);
					}
				});
				return mapped;
			}),
		}));
}

export function getEffortByMonth(): Promise<{
	data: { month: number, effort: Interval }[],
	avgByMonth: { month: number, effort: Interval }[],
	avg: { effort: Interval }
}> {
	return axiosExtract<{
		data: { effort: string, month: number }[],
		avgByMonth: { effort: string, month: number }[],
		avg: { effort: string },
	}>(axios.get('/auth/stats/effort/by-month'))
		.then((res) => ({
			data: res.data.map((el) => ({ month: el.month, effort: new Interval(el.effort) })),
			avgByMonth: res.avgByMonth.map((el) => ({ month: el.month, effort: new Interval(el.effort) })),
			avg: { effort: new Interval(res.avg.effort) },
		}));
}

export function getRateByProject(): Promise<{
	data: ({ projectId: number } & { [key in Currency]?: BigNumber })[],
	dataAvg: { [key in Currency]?: BigNumber},
	currencies: Currency[],
	projectIds: string[]
}> {
	return axiosExtract<{
		data:({ projectId: number } & { [key in Currency]?: string })[],
		dataAvg: { [key in Currency]?: string },
		currencies: Currency[],
		projectIds: string[]
			}>(
			axios.get('/auth/stats/rate/by-project'))
		.then((res) => ({
			currencies: res.currencies,
			projectIds: res.projectIds,
			data: res.data.map((el) => {
				const mapped = { projectId: el.projectId };
				Object.keys(Currency).forEach((key) => {
					if (el[key]) {
						mapped[key] = new BigNumber(el[key]);
					}
				});
				return mapped;
			}),
			dataAvg: Object.keys(res.dataAvg).reduce((obj, currency) => ({ ...obj, [currency]: new BigNumber(res.dataAvg[currency]) }), {}),
		}));
}

export function getRateByCompany(): Promise<{
	data: ({ companyId: number } & { [key in Currency]?: BigNumber })[],
	dataAvg: { [key in Currency]?: BigNumber},
	currencies: Currency[],
	companyIds: string[]
}> {
	return axiosExtract<{
		data:({ companyId: number } & { [key in Currency]?: string })[],
		dataAvg: { [key in Currency]?: string },
		currencies: Currency[],
		companyIds: string[]
			}>(
			axios.get('/auth/stats/rate/by-company'))
		.then((res) => ({
			currencies: res.currencies,
			companyIds: res.companyIds,
			data: res.data.map((el) => {
				const mapped = { companyId: el.companyId };
				Object.keys(Currency).forEach((key) => {
					if (el[key]) {
						mapped[key] = new BigNumber(el[key]);
					}
				});
				return mapped;
			}),
			dataAvg: Object.keys(res.dataAvg).reduce((obj, currency) => ({ ...obj, [currency]: new BigNumber(res.dataAvg[currency]) }), {}),
		}));
}

export function getRateByClient(): Promise<{
	data: ({ clientId: number } & { [key in Currency]?: BigNumber })[],
	dataAvg: { [key in Currency]?: BigNumber},
	currencies: Currency[],
	clientIds: string[]
}> {
	return axiosExtract<{
		data:({ clientId: number } & { [key in Currency]?: string })[],
		dataAvg: { [key in Currency]?: string },
		currencies: Currency[],
		clientIds: string[]
			}>(
			axios.get('/auth/stats/rate/by-client'))
		.then((res) => ({
			currencies: res.currencies,
			clientIds: res.clientIds,
			data: res.data.map((el) => {
				const mapped = { clientId: el.clientId };
				Object.keys(Currency).forEach((key) => {
					if (el[key]) {
						mapped[key] = new BigNumber(el[key]);
					}
				});
				return mapped;
			}),
			dataAvg: Object.keys(res.dataAvg).reduce((obj, currency) => ({ ...obj, [currency]: new BigNumber(res.dataAvg[currency]) }), {}),
		}));
}
