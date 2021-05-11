<script>
import { DateOnly } from '@cdellacqua/date-only';

import { DataTable, LoaderWrapper } from 'custom-uikit-svelte';
import { clients } from '../DAL/client';
import { projects } from '../DAL/project';
import { technologies } from '../DAL/technology';
import { __ } from '../i18n';
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
		render: (/** @type {DateOnly | null} */ endDate) => endDate ? endDate.toLocaleString() : __("WIP"),
	},
	{
		label: __("Client"),
		key: "clientId",
		render: (clientId) => {
			if (clientId) {
				const client = $clients.find((c) => c.id === clientId);
				return `${client.firstName} ${client.lastName}`;
			} else {
				return '-';
			}
		},
	},
	{
		label: __("Quote"),
		key: "price",
		render: (price, { currency }) => price ? `${price.toFormat(2)} ${currency}` : '-',
	},
	{
		label: __("Estimated effort"),
		key: "estimatedEffort",
		render: (estimatedEffort) => estimatedEffort ? estimatedEffort.toString() : '-',
	},
	{
		label: __("Technologies"),
		key: "technologyIds",
		render: (technologyIds) => technologyIds.map((tId) => $technologies.find((t) => t.id === tId).name).join(', ') || '-',
	}
];

let rows = [];

function updateRows() {
	rows = $projects;
}
$: $projects, updateRows();
</script>
<LoaderWrapper loading={$loading}>
	<div class="uk-container">
		<DataTable 
			{columns}
			{rows}
		/>
	</div>
</LoaderWrapper>
