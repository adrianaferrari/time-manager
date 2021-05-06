export function define(obj: Record<string | number | symbol, any>): Record<string | number | symbol, any> {
	return Object.keys(obj).reduce((res, key) => {
		if (obj[key] !== undefined) {
			res[key] = obj.key;
		}
		return res;
	}, {} as Record<string | number | symbol, any>);
}
