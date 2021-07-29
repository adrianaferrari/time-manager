<script>
	import { DateOnly } from "@cdellacqua/date-only";
	import { Interval } from "@cdellacqua/interval";
	import BigNumber from "bignumber.js";

	import {
		Autocomplete,
		Button,
		Checkbox,
		DatePicker,
		FixedPointInput,
		Form,
		NumberInput,
		Select,
		TextInput,
	} from "custom-uikit-svelte";
	import { createEventDispatcher, tick } from "svelte";
	import { push } from "svelte-stack-router";
	import { clients } from "../../DAL/client";
	import { save, projects } from "../../DAL/project";
	import { technologies } from "../../DAL/technology";
	import { dayLength } from "../../DAL/user";
	import { statusMatch } from "../../helpers/axios";
	import { Currency } from "../../helpers/currency";
	import { notifySuccess } from "../../helpers/notification";
	import { __ } from "../../i18n";
	import SaveClientModal from "../../modals/SaveClientModal.svelte";
	import SaveTechnologyModal from "../../modals/SaveTechnologyModal.svelte";
	import IconButton from "../IconButton.svelte";

	/** @type {import('../../DAL/project').Project | null } */
	export let entity = undefined;

	const dispatch = createEventDispatcher();

	/** @type {import('../../DAL/project').SaveProject}*/
	let toSave = {
		name: "",
		startDate: new DateOnly(),
		clientId: undefined,
		currency: null,
		endDate: null,
		estimatedEffort: null,
		price: null,
		technologyIds: [],
	};

	let isCompleted = false;

	async function submitAsync() {
		try {
			const project = await save(toSave, entity?.id);
			notifySuccess(__("Project saved"));
			loadData();
			await projects.refresh();
			dispatch("save", project);
		} catch (err) {
			statusMatch(err);
		}
	}

	function loadData() {
		if (entity) {
			toSave = {
				name: entity.name,
				startDate: entity.startDate.clone(),
				clientId: entity.clientId,
				currency: entity.currency,
				endDate: entity.endDate?.clone(),
				estimatedEffort: entity.estimatedEffort?.clone(),
				price: entity.price ? new BigNumber(entity.price) : null,
				technologyIds: entity.technologyIds,
			};
			isCompleted = !!entity.endDate;
		} else {
			toSave = {
				name: "",
				startDate: new DateOnly(),
				clientId: undefined,
				currency: null,
				endDate: null,
				estimatedEffort: null,
				price: null,
				technologyIds: [],
			};
			isCompleted = false;
		}
	}

	function updateIsCompleted(newIsCompleted) {
		isCompleted = newIsCompleted;
		if (isCompleted) {
			toSave.endDate = entity.endDate?.clone() || new DateOnly();
		} else {
			toSave.endDate = null;
		}
	}

	function toggleTechnology(newState, technologyId) {
		if (newState && !toSave.technologyIds.includes(technologyId)) {
			toSave.technologyIds = [...toSave.technologyIds, technologyId];
		} else if (!newState && toSave.technologyIds.includes(technologyId)) {
			toSave.technologyIds = toSave.technologyIds.filter(
				(tId) => tId !== technologyId
			);
		}
	}

	let showClientCreationModal = false;
	function createNewClient() {
		showClientCreationModal = true;
	}
	let showTechnologyCreationModal = false;
	function createNewTechnology() {
		showTechnologyCreationModal = true;
	}

	$: entity, loadData();
</script>

<Form {submitAsync}>
	<div uk-grid class="uk-grid-column-small uk-grid-row-collapse">
		<div class="uk-width-1-2">
			<TextInput
				label={__('Name')}
				maxlength={100}
				value={toSave.name}
				on:change={({ target }) => (toSave.name = target.value.trim())} />
		</div>
		<div class="uk-width-1-2 uk-flex uk-flex-bottom">
			<Autocomplete
				optional
				options={$clients.map((c) => ({
					label: `${c.firstName} ${c.lastName}`,
					value: c.id,
				}))}
				on:change={({ detail }) => toSave.clientId = detail}
				value={toSave.clientId}
				label={__('Client')} />
			<span>
				<IconButton
					className="uk-margin-bottom uk-margin-small-left"
					on:click={() => createNewClient()}
					icon="plus" />
			</span>
		</div>
		<div class="uk-width-1-3">
			<DatePicker
				value={toSave.startDate.toString()}
				label={__('Start date')}
				on:change={({ target }) => (toSave.startDate = target.value ? DateOnly.fromString(target.value) : new DateOnly())} />
		</div>
		<div class="uk-width-1-3">
			<Checkbox
				value={isCompleted}
				label={__('Completed')}
				optional
				on:change={({ target }) => updateIsCompleted(target.checked)} />
		</div>
		<div class="uk-width-1-3">
			{#if isCompleted}
				<DatePicker
					value={toSave.endDate?.toString()}
					label={__('End date')}
					optional={!isCompleted}
					on:change={({ target }) => (toSave.endDate = target.value ? DateOnly.fromString(target.value) : null)} />
			{/if}
		</div>
		<div class="uk-width-1-3">
			<NumberInput
				label={__('Days')}
				value={Math.floor((toSave.estimatedEffort?.totalHours || 0) / $dayLength)}
				optional
				min={0}
				step={1}
				on:change={({ target }) => (toSave.estimatedEffort = (
						toSave.estimatedEffort || new Interval(0)
					)
						.sub(
							Math.floor(
								(toSave.estimatedEffort?.totalHours || 0) / $dayLength
							) *
								$dayLength +
								':00:00'
						)
						.add(target.value * $dayLength + ':00:00'))} />
		</div>
		<div class="uk-width-1-3">
			<NumberInput
				label={__('Hours')}
				value={Math.floor((toSave.estimatedEffort?.totalHours || 0) % $dayLength)}
				optional
				min={0}
				step={1}
				on:change={({ target }) => (toSave.estimatedEffort = (
						toSave.estimatedEffort || new Interval(0)
					)
						.sub(
							Math.floor(
								(toSave.estimatedEffort?.totalHours || 0) % $dayLength
							) + ':00:00'
						)
						.add(target.value + ':00:00'))} />
		</div>
		<div class="uk-width-1-3">
			<NumberInput
				label={__('Minutes')}
				max={59}
				min={0}
				step={1}
				optional
				value={toSave.estimatedEffort?.m || 0}
				on:change={({ target }) => (toSave.estimatedEffort = (
						toSave.estimatedEffort || new Interval(0)
					)
						.sub(toSave.estimatedEffort?.m + ':00')
						.add(target.value + ':00'))} />
		</div>
		<div class="uk-width-2-3">
			<FixedPointInput
				label={__('Price')}
				value={toSave.price?.toFixed(2)}
				optional={!toSave.currency}
				on:change={({ detail }) => (toSave.price = detail ? new BigNumber(detail) : null)} />
		</div>
		<div class="uk-width-1-3">
			<Select
				label={__('Currency')}
				options={[{ label: __('Select a currency'), value: undefined }, ...Object.values(Currency).map(
						(currency) => ({ value: currency, label: __(currency) })
					)]}
				value={toSave.currency}
				optional={!toSave.price}
				on:change={({ detail }) => (toSave.currency = detail)} />
		</div>
		<div class="uk-width-1-1">
			<label class="uk-form-label">{__('Technologies')}<span>
					<IconButton
						className="uk-margin-small-left"
						on:click={() => createNewTechnology()}
						icon="plus" />
				</span></label>
			<div class="uk-flex uk-flex-wrap">
				{#each $technologies as technology (technology)}
					<Checkbox
						className="uk-margin-small-right uk-margin-small-bottom"
						value={toSave.technologyIds.includes(technology.id)}
						on:change={({ target }) => toggleTechnology(target.checked, technology.id)}
						label={technology.name}
						optional />
				{/each}
			</div>
		</div>
		<div class="uk-width-1-1 uk-text-center">
			<Button type="submit">{__('Save')}</Button>
		</div>
	</div>
</Form>

<SaveClientModal
	bind:show={showClientCreationModal}
	on:save={({ detail }) => tick().then((_) => (toSave.clientId = detail.id))} />

<SaveTechnologyModal
	bind:show={showTechnologyCreationModal}
	on:save={({ detail }) => tick().then((_) => (toSave.technologyIds = [...toSave.technologyIds, detail.id]))} />
