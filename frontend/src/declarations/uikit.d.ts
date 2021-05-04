declare module 'uikit/dist/js/uikit-icons';
declare module 'uikit' {
	export function use(v: any): any;

	export const notification: {
		(...something: any): any,
		closeAll: () => {},
	};
	export class Notification {

	}
}
