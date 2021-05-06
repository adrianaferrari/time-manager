<script>
import { DateOnly } from '@cdellacqua/date-only';
import { Interval } from '@cdellacqua/interval';
import { AsyncDataTable } from 'custom-uikit-svelte';
import * as activity from '../DAL/activity';
import { categories } from '../DAL/category';
import { projects } from '../DAL/project';
import { statusMatch } from '../helpers/axios';
import { __ } from '../i18n';

let from = undefined;
let to = undefined;
let categoryId = undefined;
let projectId = undefined;

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
		render: (_, { categoryId }) => $categories.find((category) => category.id === categoryId)?.name,
	},
	{
		label: __("Project"),
		key: "project.name",
		render: (_, { projectId }) => $projects.find((project) => project.id === projectId)?.name || "-",
	}
];

function dataProvider(query, orderBy, recordsPerPage, pageIndex) {
	return activity.list({ orderBy, pageIndex, query, recordsPerPage }, { from, to, categoryId, projectId });
}

function dataProviderErrorHandler(err) {
	statusMatch(err);
}

</script>
<AsyncDataTable 
	{dataProvider}
	{dataProviderErrorHandler}
	{columns}
/>
