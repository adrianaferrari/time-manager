import Home from './Home.svelte';
import Activities from './Activities.svelte';
import NotFound from './NotFound.svelte';

export default {
	'/': Home,
	'/activity/all': Activities,
	'*': NotFound,
};
