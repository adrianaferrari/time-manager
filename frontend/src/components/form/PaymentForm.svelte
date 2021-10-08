<script>
	import { DateOnly } from "@cdellacqua/date-only";
	import BigNumber from "bignumber.js";

	import {
		Autocomplete,
		Button,
		Checkbox,
		DatePicker,
		FixedPointInput,
		Form,
		Select,
		TextInput,
	} from "custom-uikit-svelte";
	import { createEventDispatcher } from "svelte";
	import { save } from "../../DAL/payment";
	import { projects, projectsWithClient } from "../../DAL/project";
	import { statusMatch } from "../../helpers/axios";
	import { Currency } from "../../helpers/currency";
	import { notifySuccess } from "../../helpers/notification";
	import { HttpStatus } from "../../http/status";
	import { __ } from "../../i18n";
import IconButton from '../IconButton.svelte';

	/** @type {import('../../DAL/payment').Payment | null } */
	export let entity = undefined;

	const dispatch = createEventDispatcher();

	let toSave = {
		date: new DateOnly(),
		amount: new BigNumber(0),
		currency: Currency.EUR,
		projectIds: [],
	};

	export let from = new DateOnly()
		.subMonths(1)
		.subDays(new DateOnly().date - 1)
		.toString();
	export let to = new DateOnly().subDays(new DateOnly().date - 1).toString();

	async function submitAsync() {
		try {
			const payments = await save({ 
				...toSave, 
				from: toSave.projectIds.length > 1 ? from : undefined,
				to: toSave.projectIds.length > 1 ? to : undefined }, entity?.id);
			notifySuccess(__("Payment saved"));
			loadData();
			dispatch("save", payments);
		} catch (err) {
			statusMatch(err, {
				[HttpStatus.Forbidden]: () =>
					notifyErr(__("You're not authorised to save this payment")),
			});
		}
	}

	function loadData(e) {
		if (e) {
			toSave = {
				date: e.date?.clone() ?? new DateOnly(),
				amount: new BigNumber(e.amount || 0),
				currency: e.currency || Currency.EUR,
				projectIds: [e.projectId],
			};
		} else {
			toSave = {
				date: new DateOnly(),
				amount: new BigNumber(0),
				currency: Currency.EUR,
				projectIds: [],
			};
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
	$: entity, loadData(entity);
</script>

<Form {submitAsync}>
	<div uk-grid class="uk-grid-column-small uk-grid-row-collapse">
		<div class="uk-width-1-2">
			<DatePicker
				value={toSave.date.toString()}
				on:change={({ target }) => (toSave.date = target.value ? DateOnly.fromString(target.value) : new DateOnly())}
				label={__('Date')} />
		</div>
		<div class="uk-width-1-2">
			<Autocomplete
				label={__('Project')}
				value={toSave.projectIds}
				multi
				tooltip={__('If you select more than one project, the payment will be split proportionally to the effort spent on each project in the selected interval')}
				on:change={({ detail }) => (toSave.projectIds = detail)}
				options={$projectsWithClient.map((p) => ({
					value: p.id,
					label: `${p.name} - (${
						`${p.client?.firstName ?? ''} ${p.client?.lastName ?? ''}`.trim() ||
						'N/A'
					})`,
				}))} />
		</div>
		{#if toSave.projectIds?.length > 1}
			<div class="uk-width-1-1 uk-flex uk-flex-bottom">
				<IconButton
					icon="minus"
					className="uk-margin-bottom uk-margin-small-right"
					on:click={() => (from = decrease(from))} />
				<DatePicker
					label={__('From (included)')}
					value={from}
					style="flex: 1;"
					max={to}
					on:change={({ target }) => (from = target.value)} />
				<IconButton
					icon="plus"
					className="uk-margin-bottom uk-margin-small-left"
					on:click={() => (from = increase(from))} />
			</div>
			<div class="uk-width-1-1 uk-flex uk-flex-bottom">
				<IconButton
					icon="minus"
					className="uk-margin-bottom uk-margin-small-right"
					on:click={() => (to = decrease(to))} />
				<DatePicker
					label={__('To (excluded)')}
					style="flex: 1;"
					value={to}
					min={from}
					on:change={({ target }) => (to = target.value)} />
				<IconButton
					icon="plus"
					className="uk-margin-bottom uk-margin-small-left"
					on:click={() => (to = increase(to))} />
			</div>
		{/if}
		<div class="uk-width-2-3">
			<FixedPointInput
				label={__('Price')}
				min={'0.01'}
				decimalPlaces={2}
				value={toSave.amount.toFixed(2)}
				on:change={({ detail }) => (toSave.amount = detail ? new BigNumber(detail) : new BigNumber(0))} />
		</div>
		<div class="uk-width-1-3">
			<Select
				label={__('Currency')}
				options={[{ label: __('Select a currency'), value: undefined }, ...Object.values(Currency).map(
						(currency) => ({ value: currency, label: __(currency) })
					)]}
				value={toSave.currency}
				on:change={({ detail }) => (toSave.currency = detail)} />
		</div>
		<div class="uk-width-1-1 uk-text-center">
			<Button type="submit">{__('Save')}</Button>
		</div>
	</div>
</Form>
