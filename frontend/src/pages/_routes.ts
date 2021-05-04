import Home from './Home.svelte';
import NotFound from './NotFound.svelte';

export default {
	'/': Home,
	'*': NotFound,
};
