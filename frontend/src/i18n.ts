import it from './translation/it';

const translations: {[key:string]: {[key:string]:string}} = {
	it: it as {[key:string]:string},
};

export const config = {
	lang: 'it',
};

export function __(text: string, replace: Record<string, any> = {}): string {
	let result = (translations[config.lang]?.[text] ?? text);
	Object.keys(replace)
		.sort((k1, k2) => -(k1.length - k2.length))
		.forEach((key) => {
			result = result
				.replace(new RegExp(`([^\\\\]):${key}`, 'g'), `$1${replace[key]}`)
				.replace(new RegExp(`^:${key}`, 'g'), `${replace[key]}`);
		});
	result = result.replace(/\\:/g, ':');

	return result;
}

export const decimalSeparator = Number(0.1).toLocaleString().replace(/\d/g, '');
