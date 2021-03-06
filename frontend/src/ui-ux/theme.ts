/* eslint-disable import/no-extraneous-dependencies */
import { writable as persistentWritable } from 'svelte-persistent-store/dist/local';
import { get, writable } from 'svelte/store';
import Color from 'color';

export enum Theme {
	light = 'light',
	dark = 'dark',
}

const _theme = persistentWritable('theme', null);

function update() {
	const currentTheme = get(_theme);
	if (currentTheme) {
		document.documentElement.setAttribute('data-theme', currentTheme);
	} else {
		document.documentElement.removeAttribute('data-theme');
	}
}

export const theme = writable(Theme.light); // CSS default

export function setTheme(value: Theme): void {
	_theme.set(value);
	theme.set(value);
	update();
}

export function toggleTheme(): void {
	if (get(_theme) === Theme.dark) {
		setTheme(Theme.light);
	} else {
		setTheme(Theme.dark);
	}
}

export function getColor(name: string, alpha = 1): string {
	if (alpha !== 1) {
		return Color(
			getComputedStyle(document.body).getPropertyValue(name).trim(),
		)
			.alpha(alpha)
			.string();
	}
	return getComputedStyle(document.body).getPropertyValue(name).trim();
}

export function getColorRange(color1: string, color2: string, length: number, alpha = 1): string[] {
	const baseFrom: Color = Color(getComputedStyle(document.body).getPropertyValue(color1).trim());
	const baseTo: Color = Color(getComputedStyle(document.body).getPropertyValue(color2).trim());
	const range: Color[] = new Array(length);
	const stepSize = 1 / Math.max((length - 1), 1);
	for (let i = 0; i < length; i++) {
		range[i] = baseFrom.mix(baseTo, i * stepSize);
	}
	return range.map((c) => c.alpha(alpha).string());
}

function updateOnLoad() {
	const documentComputedStyle = getComputedStyle(document.documentElement);
	const currentTheme = get(_theme);
	if (!currentTheme) {
		setTheme((documentComputedStyle
			.getPropertyValue('--prefers-color-scheme').trim() || Theme.light) as Theme);
	} else {
		setTheme(get(_theme)); // force update
	}
	window.removeEventListener('DOMContentLoaded', updateOnLoad);
}
window.addEventListener('DOMContentLoaded', updateOnLoad);
