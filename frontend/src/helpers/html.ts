let counter = 0;
const prefix = `html-id-${Math.random().toString(16).split('.')[1]}`;

export function generateId(): string {
	return `${prefix}-${counter++}`;
}

export function createCustomEvent(eventName: string, append?: Record<string, any>): Event {
	const e = new CustomEvent(eventName, {
		bubbles: true,
		cancelable: true,
	});
	Object.keys(append || {})
		.forEach((key) => { e[key] = append[key]; });
	return e;
}

export function dispatchCustomEvent(element: HTMLElement, eventName: string, append?: Record<string, any>): void {
	element.dispatchEvent(createCustomEvent(eventName, append));
}
