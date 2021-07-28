<script>
	import { Breadcrumb, Button, DataTable, LoaderWrapper } from "custom-uikit-svelte";
import { push } from 'svelte-stack-router';
import IconButton from '../components/IconButton.svelte';
	import { companies } from "../DAL/company";
	import { __ } from "../i18n";
	import SaveCompanyModal from "../modals/SaveCompanyModal.svelte";
	import AppendToBody from "../router-aware/AppendToBody.svelte";

	const loading = companies.refreshing;
	const columns = [
		{
			label: __("Name"),
			key: "name",
		},
		{
			label: __("VAT number"),
			key: "vatNumber",
			render: (vatNumber) => vatNumber || "-",
		},
		{
			label: __("Email"),
			key: "email",
			render: (email) => email || "-",
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
				onClick: () => push(`/company/details/${id}`)
			})
		}
	];

	let rows = [];

	let selected = undefined;
	let showCreateModal = false;
	let showDeleteModal = false;
	let showUpdateModal = false;

	function updateRows() {
		rows = $companies;
	}

	$: $companies, updateRows();
</script>

<LoaderWrapper loading={$loading}>
	<Breadcrumb
		path={[{ label: __("Home"), href: '/#' }, { label: __('Companies') }]} />
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

<SaveCompanyModal entity={selected} bind:show={showUpdateModal} />

<SaveCompanyModal bind:show={showCreateModal} />
