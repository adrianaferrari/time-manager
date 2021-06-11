<script>
	import { DateOnly } from "@cdellacqua/date-only";
	import BigNumber from "bignumber.js";
	import { AsyncDataTable, Button, LoaderWrapper } from "custom-uikit-svelte";
	import * as payment from "../DAL/payment";
	import { projects } from "../DAL/project";
	import { statusMatch } from "../helpers/axios";
	import { __ } from "../i18n";
	import SavePaymentModal from "../modals/SavePaymentModal.svelte";
	import AppendToBody from "../router-aware/AppendToBody.svelte";

	let from = undefined;
	let to = undefined;
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
			label: __("Amount"),
			key: "amount",
			render: (/** @type {BigNumber}*/ amount) => amount.toFormat(2),
		},
		{
			label: __("Currency"),
			key: "currency",
		},
		{
			label: __("Project"),
			key: "project.name",
			render: (_, { projectId }) =>
				$projects.find((project) => project.id === projectId)?.name || "-",
		},
	];

	const loading = projects.refreshing;

	function dataProvider(query, orderBy, recordsPerPage, pageIndex) {
		return payment.list(
			{ orderBy, pageIndex, query, recordsPerPage },
			{ from, to, projectId }
		);
	}

	function dataProviderErrorHandler(err) {
		statusMatch(err);
	}
</script>

<LoaderWrapper loading={$loading}>
	<div class="uk-container">
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
<SavePaymentModal
	entity={selected}
	bind:show={showUpdateModal}
	on:save={() => dataTable.reload()} />

<SavePaymentModal
	bind:show={showCreateModal}
	on:save={() => dataTable.reload()} />
