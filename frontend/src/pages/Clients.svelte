<script>
	import { Breadcrumb, Button, DataTable, LoaderWrapper } from "custom-uikit-svelte";
import { push } from 'svelte-stack-router';
	import { derived } from "svelte/store";
import IconButton from '../components/IconButton.svelte';
	import { clients } from "../DAL/client";
	import { companies } from "../DAL/company";
	import { __ } from "../i18n";
	import SaveClientModal from "../modals/SaveClientModal.svelte";
	import AppendToBody from "../router-aware/AppendToBody.svelte";

	const loading = derived(
		[clients.refreshing, companies.refreshing],
		([refreshingClients, refreshingCompanies]) => {
			return refreshingClients || refreshingCompanies;
		}
	);
	const columns = [
		{
			label: __("First name"),
			key: "firstName",
		},
		{
			label: __("Last name"),
			key: "lastName",
		},
		{
			label: __("Email"),
			key: "email",
			render: (email) => email || "-",
		},
		{
			label: __("Company"),
			key: "companyId",
			render: (companyId) =>
				companyId ? $companies.find((c) => c.id === companyId).name : "-",
		},

		{
			label: "",
			key: "id",
			orderable: false,
			render: (id) => ({
				component: IconButton,
				props: {
					icon: 'chevron-right',
				},
				onClick: () => push(`/client/details/${id}`)
			})
		}
	];

	let rows = [];

	let selected = undefined;
	let showCreateModal = false;
	let showDeleteModal = false;
	let showUpdateModal = false;

	function updateRows() {
		rows = $clients;
	}

	$: $clients, $companies, updateRows();
</script>

<LoaderWrapper loading={$loading}>
	<Breadcrumb
		path={[{ label: __("Home"), href: '/#' }, { label: __('Clients') }]} />
	<div class="uk-container">
		<DataTable
			{columns}
			{rows}
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

<SaveClientModal entity={selected} bind:show={showUpdateModal} />

<SaveClientModal bind:show={showCreateModal} />
