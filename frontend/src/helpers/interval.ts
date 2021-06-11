import type { Interval } from '@cdellacqua/interval';

export function printInterval(interval: Interval, dayLength: number = 8) {
	const days = Math.floor(interval.totalHours / dayLength);
	const hours = interval.totalHours % dayLength;
	const minutes = interval.m;
	return `${days ? days + "d " : ""}${hours ? hours + "h " : ""}${
		minutes ? minutes + "m" : ""
	}`.trim() || '0m';
}
