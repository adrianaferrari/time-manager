<script>
	import { DateOnly } from "@cdellacqua/date-only";

	import axios from "axios";
	import {
		Autocomplete,
		Button,
		DatePicker,
		Form,
		Modal,
Radio,
Select,
	} from "custom-uikit-svelte";
	import { tick } from "svelte";
import IconButton from '../components/IconButton.svelte';
import { categories } from '../DAL/category';
import { clients } from '../DAL/client';
	import { projects, projectsWithClient } from "../DAL/project";
	import { axiosExtract, statusMatch } from "../helpers/axios";
	import { __ } from "../i18n";

	export let show = false;
	export let from = new DateOnly()
		.subMonths(1)
		.subDays(new DateOnly().date - 1)
		.toString();
	export let to = new DateOnly().subDays(new DateOnly().date - 1).toString();
	export let projectId = undefined;
	export let clientId = undefined;
	/** @type {'none'|'project'|'client'}*/
	export let filterType = 'none';
	export let categoryIds = [];
	let roundTo = "0.5";
	let downloadLink = null;

	async function handleDownload() {
		try {
			downloadLink = null;
			await tick();
			downloadLink = await axiosExtract(
				axios.post("/auth/activity/csv", { 
					from, 
					to, 
					projectId: filterType === 'project' ? projectId : undefined, 
					categoryIds, 
					roundTo, 
					clientId: filterType === 'client' ? clientId : undefined,
				})
			);
			//show = false;
		} catch (err) {
			statusMatch(err);
		}
	}

	function decrease(dateString) {
		const dateOnly = dateString ? new DateOnly(dateString) : new DateOnly();
		return dateOnly.subMonths(1).toString();
	}

	function increase(dateString) {
		const dateOnly = dateString ? new DateOnly(dateString) : new DateOnly();
		return dateOnly.addMonths(1).toString();
	}
</script>

<Modal bind:show title={__('Download activity report')}>
	<Form submitAsync={handleDownload}>
		<div uk-grid class="uk-grid-small">
			<div class="uk-width-1-1 uk-flex uk-flex-bottom">
				<IconButton 
					icon="minus"
					className="uk-margin-bottom uk-margin-small-right"
					on:click={() => from = decrease(from)}
				/>
				<DatePicker
					label={__('From (included)')}
					value={from}
					style="flex: 1;"
					max={to}
					on:change={({ target }) => (from = target.value)} />
				<IconButton 
					icon="plus"
					className="uk-margin-bottom uk-margin-small-left"
					on:click={() => from = increase(from)}
				/>
			</div>
			<div class="uk-width-1-1 uk-flex uk-flex-bottom">
				<IconButton 
					icon="minus"
					className="uk-margin-bottom uk-margin-small-right"
					on:click={() => to = decrease(to)}
				/>
				<DatePicker
					label={__('To (excluded)')}
					style="flex: 1;"
					value={to}
					min={from}
					on:change={({ target }) => (to = target.value)} />
				<IconButton 
					icon="plus"
					className="uk-margin-bottom uk-margin-small-left"
					on:click={() => to = increase(to)}
				/>
			</div>
			<div class="uk-width-1-1">
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
					<Radio 
						options={[
							{ value: "project", label: __("Project") },
							{ value: "client", label: __("Client") },
							{ value: "none", label: __("None")}
						]}
						label={__("Filter type")}
						value={filterType}
						on:change={({ detail }) => (filterType = detail)}
					/>
				</div>
				{#if filterType === 'project'}
					<div class="uk-width-1-1">
						<Autocomplete
							label={__('Project')}
							value={projectId}
							options={$projectsWithClient.map((p) => ({ value: p.id, label: `${p.name} - (${`${p.client?.firstName ?? ''} ${p.client?.lastName ?? ''}`.trim() || 'N/A'})`}))}
							on:change={({ detail }) => (projectId = detail)} />
					</div>
				{:else if filterType === 'client'}
					<div class="uk-width-1-1">
						<Autocomplete
							label={__('Client')}
							value={clientId}
							options={$clients.map((c) => ({ label: `${c.firstName} ${c.lastName}`, value: c.id }))}
							on:change={({ detail }) => (clientId = detail)} />
					</div>
				{/if}
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
