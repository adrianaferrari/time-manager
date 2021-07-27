import Home from './Home.svelte';
import Activities from './Activities.svelte';
import Activity from './Activity.svelte';
import Categories from './Categories.svelte';
import Client from './Client.svelte';
import Clients from './Clients.svelte';
import Companies from './Companies.svelte';
import Company from './Company.svelte';
import Payment from './Payment.svelte';
import Payments from './Payments.svelte';
import Project from './Project.svelte';
import Projects from './Projects.svelte';
import Settings from './Settings.svelte';
import Stats from './Stats.svelte';
import Technologies from './Technologies.svelte';
import NotFound from './NotFound.svelte';

export default {
	'/': Home,
	'/activity/all': Activities,
	'/activity/details/:id': Activity,
	'/category/all': Categories,
	'/client/all': Clients,
	'/client/details/:id': Client,
	'/company/all': Companies,
	'/company/details/:id': Company,
	'/payment/all': Payments,
	'/project/:projectId/payment/details/:id': Payment,
	'/project/all': Projects,
	'/project/details/:id': Project,
	'/settings': Settings,
	'/stats': Stats,
	'/technology/all': Technologies,
	'*': NotFound,
};
