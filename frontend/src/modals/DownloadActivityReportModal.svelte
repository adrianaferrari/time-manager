<script>
	import { DateOnly } from "@cdellacqua/date-only";

	import axios from "axios";
	import {
		Autocomplete,
		Button,
		DatePicker,
		Form,
		Modal,
Select,
	} from "custom-uikit-svelte";
	import { tick } from "svelte";
import { categories } from '../DAL/category';
	import { projects } from "../DAL/project";
	import { axiosExtract, statusMatch } from "../helpers/axios";
	import { __ } from "../i18n";

	export let show = false;
	export let from = new DateOnly()
		.subMonths(1)
		.subDays(new DateOnly().date - 1);
	export let to = new DateOnly().subDays(new DateOnly().date - 1);
	export let projectId = undefined;
	export let categoryIds = [];
	let roundTo = "0.5";
	let downloadLink = null;

	async function handleDownload() {
		try {
			downloadLink = null;
			await tick();
			downloadLink = await axiosExtract(
				axios.post("/auth/activity/csv", { from, to, projectId, categoryIds, roundTo })
			);
			//show = false;
		} catch (err) {
			statusMatch(err);
		}
	}
</script>

<Modal bind:show title={__('Download activity report')}>
	<Form submitAsync={handleDownload}>
		<div uk-grid class="uk-grid-small">
			<div class="uk-width-1-2">
				<DatePicker
					label={__('From (included)')}
					value={from}
					max={to}
					on:change={({ target }) => (from = target.value)} />
			</div>
			<div class="uk-width-1-2">
				<DatePicker
					label={__('To (excluded)')}
					value={to}
					min={from}
					on:change={({ target }) => (to = target.value)} />
			</div>
			<div class="uk-width-1-2">
				<Autocomplete
					label={__('Project')}
					optional
					value={projectId}
					options={$projects.map((p) => ({ label: p.name, value: p.id }))}
					on:change={({ detail }) => (projectId = detail)} />
			</div>
			<div class="uk-width-1-2">
				<Select
					label={__('Round to')}
					optional
					value={roundTo}
					options={[
						{ label: __("30 minutes (0.5h)"), value: "0.5" },
						{ label: __("15 minutes (0.25h)"), value: "0.25" },
						{ label: __("No decimal places"), value: "1" },
						{ label: __("1 decimal place"), value: "0.1" },
						{ label: __("2 decimal places"), value: "0.01"},
					]}
					on:change={({ detail }) => (roundTo = detail)} />
			</div>
			<div class="uk-width-1-1">
				<Autocomplete
					label={__('Categories to include (leave empty to include all)')}
					optional
					multi
					value={categoryIds}
					options={$categories.map((c) => ({ label: c.name, value: c.id }))}
					on:change={({ detail }) => (categoryIds = detail)} />
			</div>
			<div class="uk-width-1-1 uk-text-center">
				<Button icon="download" type="submit">{__('Download')}</Button>
			</div>
		</div>
	</Form>
</Modal>
{#if downloadLink}
	<div
		style="height: 0; width: 0; overflow: hidden; pointer-events: none; opacity: 0">
		<iframe title="download" src={downloadLink} />
	</div>
{/if}
