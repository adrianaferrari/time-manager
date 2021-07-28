<script>
	import { Breadcrumb, Button } from "custom-uikit-svelte";
	import { push } from "svelte-stack-router";
	import { __ } from "../i18n";
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
	<Button className="uk-margin-small-bottom" on:click={() => push('/activity/all')}>{__('Activities')}</Button>
	<Button className="uk-margin-small-bottom" on:click={() => push('/category/all')}>{__('Categories')}</Button>
	<Button className="uk-margin-small-bottom" on:click={() => push('/client/all')}>{__('Clients')}</Button>
	<Button className="uk-margin-small-bottom" on:click={() => push('/company/all')}>{__('Companies')}</Button>
	<Button className="uk-margin-small-bottom" on:click={() => push('/payment/all')}>{__('Payments')}</Button>
	<Button className="uk-margin-small-bottom" on:click={() => push('/project/all')}>{__('Projects')}</Button>
	<Button className="uk-margin-small-bottom" on:click={() => push('/category/all')}>{__('Stats')}</Button>
	<Button className="uk-margin-small-bottom" on:click={() => push('/technology/all')}>{__('Technologies')}</Button>
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
