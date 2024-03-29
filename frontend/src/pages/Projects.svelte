<script>
	import { DateOnly } from "@cdellacqua/date-only";

	import {
		Breadcrumb,
		Button,
		Card,
		DataTable,
		LoaderWrapper,
	} from "custom-uikit-svelte";
	import { push } from "svelte-stack-router";
	import IconButton from "../components/IconButton.svelte";
	import { clients } from "../DAL/client";
	import { projects } from "../DAL/project";
	import { technologies } from "../DAL/technology";
	import { dayLength } from "../DAL/user";
	import { printInterval } from "../helpers/interval";
	import { __ } from "../i18n";
	import SaveProjectModal from "../modals/SaveProjectModal.svelte";
	import AppendToBody from "../router-aware/AppendToBody.svelte";
	const loading = projects.refreshing;

	const columns = [
		{
			label: __("Name"),
			key: "name",
		},
		{
			label: __("Start date"),
			key: "startDate",
			render: (/** @type {DateOnly} */ startDate) => startDate.toLocaleString(),
		},
		{
			label: __("End date"),
			key: "endDate",
			render: (/** @type {DateOnly | null} */ endDate) =>
				endDate ? endDate.toLocaleString() : __("WIP"),
		},
		{
			label: __("Client"),
			key: "clientId",
			render: (clientId) => {
				if (clientId) {
					const client = $clients.find((c) => c.id === clientId);
					return `${client.firstName} ${client.lastName}`;
				} else {
					return "-";
				}
			},
		},
		{
			label: __("Quote"),
			key: "price",
			render: (price, { currency }) =>
				price ? `${price.toFormat(2)} ${currency}` : "-",
		},
		{
			label: __("Estimated effort"),
			key: "estimatedEffort",
			render: (estimatedEffort) => {
				if (estimatedEffort) {
					return printInterval(estimatedEffort, $dayLength);
				} else {
					return "-";
				}
			},
		},
		{
			label: __("Technologies"),
			key: "technologyIds",
			render: (technologyIds) =>
				technologyIds
					.map((tId) => $technologies.find((t) => t.id === tId).name)
					.join(", ") || "-",
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
				onClick: () => push(`/project/details/${id}`),
			}),
		},
	];

	let rows = [];

	let selected = undefined;
	let showCreateModal = false;
	let showDeleteModal = false;
	let showUpdateModal = false;

	function updateRows() {
		rows = $projects;
	}
	$: $projects, $dayLength, updateRows();
</script>

<Breadcrumb
path={[{ label: __('Home'), href: '/#' }, { label: __('Projects') }]} />
<div class="uk-container">
	<Card>
		<DataTable
			{columns}
			{rows}
			recordsPerPage={15}
			on:row-dblclick={({ detail }) => ((selected = detail), (showUpdateModal = true))} />
	</Card>
</div>

<AppendToBody>
	<IconButton
		style="position: fixed; right: 15px; bottom: 15px;"
		icon="plus"
		tooltip={`title: ${__("Add project")}; pos: left;`}
		className="icon-button-secondary icon-button-large"
		on:click={() => (showCreateModal = true)} />
</AppendToBody>

<SaveProjectModal entity={selected} bind:show={showUpdateModal} />

<SaveProjectModal bind:show={showCreateModal} />
