import Home from './Home.svelte';
import Activities from './Activities.svelte';
import Categories from './Categories.svelte';
import Projects from './Projects.svelte';
import Technologies from './Technologies.svelte';
import NotFound from './NotFound.svelte';

export default {
	'/': Home,
	'/activity/all': Activities,
	'/category/all': Categories,
	'/project/all': Projects,
	'/technology/all': Technologies,
	'*': NotFound,
};
