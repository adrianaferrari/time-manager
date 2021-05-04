import UIkit, { Notification } from 'uikit';

export function notify(
	message: string,
	status: 'primary'|'success'|'warning'|'danger' = 'primary',
	icon: string|null = null,
	position: 'top-left'|'top-center'|'top-right'|'bottom-left'|'bottom-center'|'bottom-right' = 'top-center',
	timeout = 2500,
): Notification {
	return UIkit.notification({
		message: icon ? `<span uk-icon="icon: ${icon}"></span> ${message}` : message,
		status,
		position,
		timeout,
	});
}

export function notifyErr(message: string, icon = 'warning'): Notification {
	return notify(message, 'danger', icon);
}

export function notifySuccess(message: string, icon?: string): Notification {
	return notify(message, 'success', icon);
}

export function notifyWarn(message: string, icon = 'warning'): Notification {
	return notify(message, 'warning', icon);
}

export function closeAllNotifications(): void {
	UIkit.notification.closeAll();
}
