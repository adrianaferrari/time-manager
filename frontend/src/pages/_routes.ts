import Home from './Home.svelte';
import Activities from './Activities.svelte';
import Categories from './Categories.svelte';
import Clients from './Clients.svelte';
import Companies from './Companies.svelte';
import Payments from './Payments.svelte';
import Projects from './Projects.svelte';
import Technologies from './Technologies.svelte';
import NotFound from './NotFound.svelte';

export default {
	'/': Home,
	'/activity/all': Activities,
	'/category/all': Categories,
	'/client/all': Clients,
	'/company/all': Companies,
	'/payment/all': Payments,
	'/project/all': Projects,
	'/technology/all': Technologies,
	'*': NotFound,
};
