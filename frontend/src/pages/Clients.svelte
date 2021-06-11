<script>

import { DataTable, LoaderWrapper } from 'custom-uikit-svelte';
import { derived } from 'svelte/store';
import { clients } from '../DAL/client';
import { companies } from '../DAL/company';
import { __ } from '../i18n';
import SaveClientModal from '../modals/SaveClientModal.svelte';

const loading = derived([clients.refreshing, companies.refreshing], ([refreshingClients, refreshingCompanies]) => {
	return refreshingClients || refreshingCompanies;
});
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
		render: (email) => email || '-',
	},
	{
		label: __("Company"),
		key: "companyId",
		render: (companyId) => companyId ? $companies.find((c) => c.id === companyId).name : '-',
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
	<div class="uk-container">
		<DataTable 
			{columns}
			{rows}
			on:row-dblclick={({ detail }) => (selected = detail, showUpdateModal = true)}
		/>
	</div>
</LoaderWrapper>

<SaveClientModal
	entity={selected}
	bind:show={showUpdateModal}
/>
