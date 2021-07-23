import type { Interval } from '@cdellacqua/interval';

export function printInterval(interval: Interval, dayLength = 8): string {
	const days = Math.floor((interval.h + interval.d * 24) / dayLength);
	const hours = interval.h % dayLength;
	const minutes = interval.m;
	return `${days ? `${days}d ` : ''}${hours ? `${hours}h ` : ''}${
		minutes ? `${minutes}m` : ''
	}`.trim() || '0m';
}
