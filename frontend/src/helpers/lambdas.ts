// eslint-disable-next-line @typescript-eslint/no-empty-function
export function noop(): void|undefined {}

export function identity<T>(value: T): T { return value; }

export function constructIfPresent<T, U>(v: T|null|undefined, Constructor: new (v: T) => U): U|null|undefined {
	return v !== null && v !== undefined ? new Constructor(v) : v as (null|undefined);
}

export function nullary<O>(fn: (...args: any[]) => O): () => O {
	return () => fn();
}

export function unary<I, O>(fn: (v: I, ...rest: any[]) => O): (v: I) => O {
	return (v) => fn(v);
}

export function binary<I1, I2, O>(fn: (v1: I1, v2: I2, ...rest: any[]) => O): (v1: I1, v2: I2) => O {
	return (v1, v2) => fn(v1, v2);
}

export function ternary<I1, I2, I3, O>(fn: (v1: I1, v2: I2, v3: I3, ...rest: any[]) => O): (v1: I1, v2: I2, v3: I3) => O {
	return (v1, v2, v3) => fn(v1, v2, v3);
}

export function quaternary<I1, I2, I3, I4, O>(fn: (v1: I1, v2: I2, v3: I3, v4: I4, ...rest: any[]) => O): (v1: I1, v2: I2, v3: I3, v4: I4) => O {
	return (v1, v2, v3, v4) => fn(v1, v2, v3, v4);
}
