<script>
	import { DateOnly } from "@cdellacqua/date-only";
	import { Interval } from "@cdellacqua/interval";
	import {
		AsyncDataTable,
		Autocomplete,
		Button,
		Breadcrumb,
		DatePicker,
		LoaderWrapper,
	} from "custom-uikit-svelte";
	import { onResume, push } from "svelte-stack-router";
	import { derived } from "svelte/store";
	import IconButton from "../components/IconButton.svelte";
	import * as activity from "../DAL/activity";
	import { categories } from "../DAL/category";
	import { projects } from "../DAL/project";
	import { statusMatch } from "../helpers/axios";
	import { __ } from "../i18n";
	import SaveActivityModal from "../modals/SaveActivityModal.svelte";
	import AppendToBody from "../router-aware/AppendToBody.svelte";

	let from = undefined;
	let to = undefined;
	let categoryId = undefined;
	let projectId = undefined;

	let selected = undefined;
	let showCreateModal = false;
	let showDeleteModal = false;
	let showUpdateModal = false;

	let dataTable = undefined;

	let columns = [
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
			label: __("Category"),
			key: "category.name",
			render: (_, { categoryId }) =>
				$categories.find((category) => category.id === categoryId)?.name,
		},
		{
			label: __("Project"),
			key: "project.name",
			render: (_, { projectId }) =>
				$projects.find((project) => project.id === projectId)?.name || "-",
		},
		{
			label: "",
			key: "id",
			orderable: false,
			render: (id) => ({
				component: IconButton,
				props: {
					icon: "chevron-right",
				},
				onClick: () => push(`/activity/details/${id}`),
			}),
		},
	];

	let loading = derived(
		[categories.refreshing, projects.refreshing],
		([refreshingCategories, refreshingProjects]) => {
			return refreshingCategories || refreshingProjects;
		}
	);

	function dataProvider(query, orderBy, recordsPerPage, pageIndex) {
		return activity.list(
			{ orderBy, pageIndex, query, recordsPerPage },
			{
				from: from || undefined,
				to: to || undefined,
				categoryId: categoryId || undefined,
				projectId: projectId || undefined,
			}
		);
	}

	function dataProviderErrorHandler(err) {
		statusMatch(err);
	}

	onResume((resumeParams) => {
		if (resumeParams?.refresh) {
			dataTable?.reload();
		}
	});
</script>

<LoaderWrapper loading={$loading}>
	<Breadcrumb path={[{ label: __('Activities') }]} />
	<div class="uk-container">
		<div class="uk-flex uk-flex-wrap">
			<div class="uk-width-1-4@m uk-width-1-2">
				<DatePicker optional label={__('From')} bind:value={from} />
			</div>
			<div class="uk-width-1-4@m uk-width-1-2">
				<DatePicker optional label={__('To')} bind:value={to} />
			</div>
			<div class="uk-width-1-4@m uk-width-1-2">
				<Autocomplete
					optional
					label={__('Category')}
					options={$categories.map((c) => ({ label: c.name, value: c.id }))}
					bind:value={categoryId} />
			</div>
			<div class="uk-width-1-4@m uk-width-1-2">
				<Autocomplete
					label={__('Project')}
					options={$projects.map((p) => ({ label: p.name, value: p.id }))}
					bind:value={projectId}
					optional />
			</div>
		</div>
		<AsyncDataTable
			{dataProvider}
			{dataProviderErrorHandler}
			{columns}
			bind:this={dataTable}
			on:row-dblclick={({ detail }) => ((selected = detail), (showUpdateModal = true))} />
	</div>
</LoaderWrapper>

<AppendToBody>
	<Button
		style="position: fixed; right: 15px; bottom: 15px;"
		icon="plus"
		variant="secondary"
		on:click={() => (showCreateModal = true)} />
</AppendToBody>

<SaveActivityModal
	entity={selected}
	bind:show={showUpdateModal}
	on:save={() => dataTable.reload()} />

<SaveActivityModal
	bind:show={showCreateModal}
	on:save={() => dataTable.reload()} />
