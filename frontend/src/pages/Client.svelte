<script>
	import { Breadcrumb, Card, LoaderWrapper } from "custom-uikit-svelte";
	import { onMount } from "svelte";

	import { setResumable } from "svelte-stack-router";
	import Anchor from "../components/Anchor.svelte";
import CardActions from '../components/CardActions.svelte';
import IconButton from '../components/IconButton.svelte';
	import { get } from "../DAL/client";
	import { companies } from "../DAL/company";
	import { projects } from "../DAL/project";
import { dayLength } from '../DAL/user';
	import { statusMatch } from "../helpers/axios";
import { printInterval } from '../helpers/interval';
	import { __ } from "../i18n";
import SaveClientModal from '../modals/SaveClientModal.svelte';

	export let params = {
		id: null,
	};

	/** @type {import('../DAL/client').ClientDetails | null}*/
	let details = null;
	let loading = false;
	/** @type {import('../DAL/company').Company | null}*/
	let company = null;
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
			company = $companies.find((c) => details.companyId === c.id);
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
		path={[{ href: '/#/client/all', label: __('Clients') }, { label: `${details.firstName} ${details.lastName}` }]} />
	<Card
		style="position: relative"
		className="uk-width-3-4@l uk-width-4-5@m uk-width-5-6 uk-margin-auto"
		title={`${details.firstName} ${details.lastName}`}>
		<CardActions 
			{actions}
			on:edit={() => showUpdateModal = true}
			on:delete={() => showDeleteModal = true}
		/>
		<h5>{__('Email')}</h5>
		<p>{details.email || __('N/A')}</p>
		<h5>{__('Company')}</h5>
		<p>
			{#if company}
				<Anchor href={`/company/details/${company.id}`}>{company.name}</Anchor>
			{:else}{__('N/A')}{/if}
		</p>
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
		<h5>{__('Time spent working for this client')}</h5>
		<p>{printInterval(details.timeSpent, $dayLength)}</p>
	</Card>
</LoaderWrapper>

<SaveClientModal 
	entity={details}
	bind:show={showUpdateModal}
	on:save={() => loadData()}
/>
