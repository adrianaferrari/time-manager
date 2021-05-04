// eslint-disable-next-line import/no-extraneous-dependencies
import { derived } from 'svelte/store';
import { identity, noop } from '../helpers/lambdas';
import { user } from '../DAL/user';
import { theme } from '../ui-ux/theme';

theme.subscribe(noop);

derived([user], identity)
	.subscribe(([$user]) => {
		if ($user) {
			// TODO: refresh
		} else {
			// TODO: clear
		}
	});
