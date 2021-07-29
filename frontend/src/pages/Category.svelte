<script>
	import {
		Breadcrumb,
		Card,
		DataTable,
		LoaderWrapper,
	} from "custom-uikit-svelte";

	import { pop, setResumable } from "svelte-stack-router";
	import CardActions from "../components/CardActions.svelte";
	import IconButton from "../components/IconButton.svelte";
	import { get } from "../DAL/category";
	import { projects } from "../DAL/project";
	import { dayLength } from "../DAL/user";
	import { statusMatch } from "../helpers/axios";
	import { printInterval } from "../helpers/interval";
	import { __ } from "../i18n";
	import DeleteCategoryModal from "../modals/DeleteCategoryModal.svelte";
	import SaveActivityModal from "../modals/SaveActivityModal.svelte";
	import SaveCategoryModal from "../modals/SaveCategoryModal.svelte";

	export let params = {
		id: null,
	};

	/** @type {import('../DAL/category').CategoryDetails | null}*/
	let details = null;
	let loading = false;

	let showUpdateModal = false;
	let showDeleteModal = false;
	let showAddActivityModal = false;

	/** @type {Partial<import('../DAL/activity').SaveActivity> | null}*/
	let newActivityDetails = null;

	const actions = [
		{ name: "edit", tooltip: __("Edit"), icon: "pencil" },
		{ name: "delete", tooltip: __("Delete"), icon: "trash" },
	];

	const activityColumns = [
		{
			label: __("Date"),
			key: "date",
			render: (/** @type {DateOnly}*/ date) => date.toLocaleString(),
		},
		{
			label: __("Time spent"),
			key: "timeSpent",
			render: (/** @type {Interval}*/ timeSpent) => timeSpent.toString(),
		},
		{
			label: __("Description"),
			key: "description",
		},
		{
			label: __("Project"),
			key: "project.name",
			render: (_, { projectId }) =>
				$projects.find((project) => project.id === projectId)?.name ??
				__("N/A"),
		},
	];

	setResumable(false);

	async function loadData() {
		if (!params.id) {
			return;
		}
		newActivityDetails = { categoryId: params.id };
		loading = true;
		try {
			details = await get(params.id);
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
		path={[{ label: __('Home'), href: '/#' }, { href: '/#/category/all', label: __('Categories') }, { label: details.name }]} />
	<Card
		style="position: relative"
		className="uk-width-3-4@l uk-width-4-5@m uk-width-5-6 uk-margin-auto"
		title={details.name}>
		<CardActions
			{actions}
			on:edit={() => (showUpdateModal = true)}
			on:delete={() => (showDeleteModal = true)} />
		<h5>{__('Time spent working on this category of activities')}</h5>
		<p>{printInterval(details.timeSpent, $dayLength)}</p>
		<h5>
			{__('Activities (:len)', { len: details.activities.length })}
			<IconButton
				className="uk-margin-small-left"
				on:click={() => (showAddActivityModal = true)}
				icon="plus" />
		</h5>
		<DataTable
			columns={activityColumns}
			rows={details.activities}
			recordsPerPage={10}
			noResultText={__('No activities found')}
			on:row-click={({ detail }) => push(`/activity/details/${detail.id}`)} />
	</Card>
</LoaderWrapper>

<SaveCategoryModal
	entity={details}
	bind:show={showUpdateModal}
	on:save={() => loadData()} />

<DeleteCategoryModal
	entity={details}
	bind:show={showDeleteModal}
	on:delete={() => pop()} />

<SaveActivityModal
	entity={newActivityDetails}
	bind:show={showAddActivityModal}
	on:save={() => loadData()} />
