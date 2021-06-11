<script>

	import { DataTable, LoaderWrapper } from 'custom-uikit-svelte';
	import { companies } from '../DAL/company';
	import { __ } from '../i18n';
import SaveCompanyModal from '../modals/SaveCompanyModal.svelte';

const loading = companies.refreshing;
const columns = [
	{
		label: __("Name"),
		key: "name",
	},
	{
		label: __("VAT number"),
		key: "vatNumber",
		render: (vatNumber) => vatNumber || '-',
	},
	{
		label: __("Email"),
		key: "email",
		render: (email) => email || '-',
	},
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
	<div class="uk-container">
		<DataTable 
			{columns}
			{rows}
			on:row-dblclick={({ detail }) => (selected = detail, showUpdateModal = true)}
		/>
	</div>
</LoaderWrapper>

<SaveCompanyModal
	entity={selected}
	bind:show={showUpdateModal}
/>
