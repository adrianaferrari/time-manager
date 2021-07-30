<script>
	import { Breadcrumb, Button } from "custom-uikit-svelte";
	import { push } from "svelte-stack-router";
import Anchor from '../components/Anchor.svelte';
	import { __ } from "../i18n";
import DownloadActivityReportModal from '../modals/DownloadActivityReportModal.svelte';
	import SaveActivityModal from "../modals/SaveActivityModal.svelte";
	import SaveCategoryModal from "../modals/SaveCategoryModal.svelte";
	import SaveClientModal from "../modals/SaveClientModal.svelte";
	import SaveCompanyModal from "../modals/SaveCompanyModal.svelte";
	import SavePaymentModal from "../modals/SavePaymentModal.svelte";
	import SaveProjectModal from "../modals/SaveProjectModal.svelte";
	import SaveTechnologyModal from "../modals/SaveTechnologyModal.svelte";

	let showAddActivityModal = false;
	let showAddCategoryModal = false;
	let showAddClientModal = false;
	let showAddCompanyModal = false;
	let showAddPaymentModal = false;
	let showAddProjectModal = false;
	let showAddTechnologyModal = false;
	let showDownloadActivityReportModal = false;
</script>

<Breadcrumb path={[{ label: __('Home') }]} />
<div class="uk-container">
	<h4>{__('Shortcuts')}</h4>
	<Button className="uk-margin-small-bottom" on:click={() => (showAddActivityModal = true)} icon="plus">
		{__('New activity')}
	</Button>
	<Button className="uk-margin-small-bottom" on:click={() => (showAddCategoryModal = true)} icon="plus">
		{__('New category')}
	</Button>
	<Button className="uk-margin-small-bottom" on:click={() => (showAddClientModal = true)} icon="plus">
		{__('New client')}
	</Button>
	<Button className="uk-margin-small-bottom" on:click={() => (showAddCompanyModal = true)} icon="plus">
		{__('New company')}
	</Button>
	<Button className="uk-margin-small-bottom" on:click={() => (showAddPaymentModal = true)} icon="plus">
		{__('New payment')}
	</Button>
	<Button className="uk-margin-small-bottom" on:click={() => (showAddProjectModal = true)} icon="plus">
		{__('New project')}
	</Button>
	<Button className="uk-margin-small-bottom" on:click={() => (showAddTechnologyModal = true)} icon="plus">
		{__('New technology')}
	</Button>
	<h4>{__('Pages')}</h4>
	<Anchor className="uk-margin-small-bottom uk-button uk-button-default" href='/activity/all'>{__('Activities')}</Anchor>
	<Anchor className="uk-margin-small-bottom uk-button uk-button-default" href='/category/all'>{__('Categories')}</Anchor>
	<Anchor className="uk-margin-small-bottom uk-button uk-button-default" href='/client/all'>{__('Clients')}</Anchor>
	<Anchor className="uk-margin-small-bottom uk-button uk-button-default" href='/company/all'>{__('Companies')}</Anchor>
	<Anchor className="uk-margin-small-bottom uk-button uk-button-default" href='/payment/all'>{__('Payments')}</Anchor>
	<Anchor className="uk-margin-small-bottom uk-button uk-button-default" href='/project/all'>{__('Projects')}</Anchor>
	<Anchor className="uk-margin-small-bottom uk-button uk-button-default" href='/stats'>{__('Stats')}</Anchor>
	<Anchor className="uk-margin-small-bottom uk-button uk-button-default" href='/technology/all'>{__('Technologies')}</Anchor>
	<h4>{__('Reports')}</h4>
	<Button className="uk-margin-small-bottom" icon="donwload" on:click={() => showDownloadActivityReportModal = true}>{__("Activity")}</Button>
</div>

<SaveActivityModal
	bind:show={showAddActivityModal}
	on:save={() => push('/activity/all')} />

<SaveCategoryModal
	bind:show={showAddCategoryModal}
	on:save={() => push('/category/all')} />

<SaveClientModal
	bind:show={showAddClientModal}
	on:save={() => push('/client/all')} />

<SaveCompanyModal
	bind:show={showAddCompanyModal}
	on:save={() => push('/company/all')} />

<SavePaymentModal
	bind:show={showAddPaymentModal}
	on:save={() => push('/payment/all')} />

<SaveProjectModal
	bind:show={showAddProjectModal}
	on:save={() => push('/project/all')} />

<SaveTechnologyModal
	bind:show={showAddTechnologyModal}
	on:save={() => push('/technology/all')} />

<DownloadActivityReportModal 
	bind:show={showDownloadActivityReportModal}
/>
