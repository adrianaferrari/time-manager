// eslint-disable-next-line import/no-extraneous-dependencies
import { derived } from 'svelte/store';
import { identity, noop } from '../helpers/lambdas';
import { user } from '../DAL/user';
import { theme } from '../ui-ux/theme';
import { categories } from '../DAL/category';
import { projects } from '../DAL/project';

theme.subscribe(noop);

derived([user], identity)
	.subscribe(([$user]) => {
		if ($user) {
			categories.refresh();
			projects.refresh();
		} else {
			categories.setRaw([]);
			projects.setRaw([]);
		}
	});
