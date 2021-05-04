import type { Readable } from 'svelte/store';

module 'svelte/store' {
	declare function get<T>(store: Readable<T>): T;
}
