<script>
	import { Breadcrumb, Card, LoaderWrapper } from "custom-uikit-svelte";
	import { onMount } from "svelte";

	import { pop, setResumable } from "svelte-stack-router";
	import Anchor from "../components/Anchor.svelte";
import CardActions from '../components/CardActions.svelte';
import IconButton from '../components/IconButton.svelte';
	import { get } from "../DAL/activity";
	import { projects } from "../DAL/project";
import { dayLength } from '../DAL/user';
	import { statusMatch } from "../helpers/axios";
import { printInterval } from '../helpers/interval';
	import { __ } from "../i18n";
import { categories } from '../DAL/category';
import SaveActivityModal from '../modals/SaveActivityModal.svelte';
import DeleteActivityModal from '../modals/DeleteActivityModal.svelte';

	export let params = {
		id: null,
	};

	/** @type {import('../DAL/activity').Activity | null}*/
	let details = null;
	let loading = false;
	/** @type {import('../DAL/project').Project | null}*/
	let project = null;
	/** @type {import('../DAL/category').Category | null}*/
	let category = null;

	let showUpdateModal = false;
	let showDeleteModal = false;

	const actions = [
		{ name: 'edit', tooltip: __("Edit"), icon: 'pencil' },
		{ name: 'delete', tooltip: __("Delete"), icon: 'trash' },
	];

	setResumable(false);

	async function loadData() {
		if (!params.id) {
			return;
		}
		loading = true;
		try {
			details = await get(params.id);
			category = $categories.find((c) => c.id === details.categoryId);
			project = $projects.find((p) => p.id === details.projectId);
		} catch (err) {
			statusMatch(err);
		} finally {
			loading = false;
		}
	}

	$: params.id, loadData();
</script>

<LoaderWrapper {loading}>
	<Breadcrumb
		path={[{ href: '/#/activity/all', label: __('Activities') }, { label: `${category.name} - ${details.date.toLocaleString()}` }]} />
	<Card
		style="position: relative"
		className="uk-width-3-4@l uk-width-4-5@m uk-width-5-6 uk-margin-auto"
		title={`${category.name} - ${details.date.toLocaleString()}`}>
		<CardActions 
			{actions}
			on:edit={() => showUpdateModal = true}
			on:delete={() => showDeleteModal = true}
		/>
		<h5>{__('Date')}</h5>
		<p>{details.date.toLocaleString()}</p>
		<h5>{__('Time spent')}</h5>
		<p>{printInterval(details.timeSpent, $dayLength)}</p>
		<h5>{__('Category')}</h5>
		<p><Anchor href={`/category/details/${category.id}`}>{category.name}</Anchor></p>
		<h5>{__('Project')}</h5>
		<p>
			{#if project}
				<Anchor href={`/project/details/${project.id}`}>{project.name}</Anchor>
			{:else}
				{__('N/A')}
			{/if}
		</p>
		<h5>{__("Description")}</h5>
		<p>{details.description}</p>
	</Card>
</LoaderWrapper>

<SaveActivityModal 
	entity={details}
	bind:show={showUpdateModal}
	on:save={() => loadData()}
/>

<DeleteActivityModal 
	entity={details}
	bind:show={showDeleteModal}
	on:delete={() => pop({ refresh: true })}
/>
