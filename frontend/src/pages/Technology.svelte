<script>
	import { Breadcrumb, Card, LoaderWrapper } from "custom-uikit-svelte";
	import { pop, setResumable } from "svelte-stack-router";
	import Anchor from "../components/Anchor.svelte";
import CardActions from '../components/CardActions.svelte';
	import { get } from "../DAL/technology";
	import { projects } from "../DAL/project";
	import { statusMatch } from "../helpers/axios";
	import { __ } from "../i18n";
import SaveTechnologyModal from '../modals/SaveTechnologyModal.svelte';
import DeleteTechnologyModal from '../modals/DeleteTechnologyModal.svelte';

	export let params = {
		id: null,
	};

	/** @type {import('../DAL/technology').TechnologyDetails | null}*/
	let details = null;
	let loading = false;
	/**@type {import('../DAL/project').Project[]}*/
	let projectList = [];

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
			projectList = details.projectIds.map((pId) =>
				$projects.find((p) => p.id === pId)
			);
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
		path={[{ label: __("Home"), href: '/#' }, { href: '/#/technology/all', label: __('Technologies') }, { label: details.name }]} />
	<Card
		style="position: relative"
		className="uk-width-3-4@l uk-width-4-5@m uk-width-5-6 uk-margin-auto"
		title={details.name}>
		<CardActions 
			{actions}
			on:edit={() => showUpdateModal = true}
			on:delete={() => showDeleteModal = true}
		/>
		<h5>{__('Projects (:len)', { len: projectList.length })}</h5>
		<ul class="uk-list">
			{#each projectList as project}
				<li>
					<Anchor href={`/project/details/${project.id}`}>{project.name}</Anchor>
				</li>
			{:else}
				<p class="uk-text-italic">{__("No projects found")}</p>
			{/each}
		</ul>
	</Card>
</LoaderWrapper>

<SaveTechnologyModal 
	entity={details}
	bind:show={showUpdateModal}
	on:save={() => loadData()}
/>

<DeleteTechnologyModal
	entity={details}
	bind:show={showDeleteModal}
	on:delete={() => pop()}
/>
