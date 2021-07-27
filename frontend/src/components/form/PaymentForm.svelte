<script>
import { DateOnly } from '@cdellacqua/date-only';
import BigNumber from 'bignumber.js';

	import { Autocomplete, Button, DatePicker, FixedPointInput, Form, Select, TextInput } from 'custom-uikit-svelte';
	import { createEventDispatcher } from 'svelte';
	import { save } from '../../DAL/payment';
import { projects } from '../../DAL/project';
	import { statusMatch } from '../../helpers/axios';
import { Currency } from '../../helpers/currency';
	import { notifySuccess } from '../../helpers/notification';
	import { HttpStatus } from '../../http/status';
	import { __ } from '../../i18n';
	
	/** @type {import('../../DAL/payment').Payment | null } */
	export let entity = undefined;
	
	const dispatch = createEventDispatcher();
	
	let toSave = {
		date: new DateOnly(),
		amount: new BigNumber(0),
		currency: Currency.EUR,
		projectId: undefined,
	};
	
	async function submitAsync() {
		try {
			const payment = await save(toSave, entity?.id);
			notifySuccess(__("Payment saved"));
			loadData();
			dispatch('save', payment);
		} catch (err) {
			statusMatch(err, {
				[HttpStatus.Forbidden]: () => notifyErr(__("You're not authorised to save this payment")),
			});
		}
	}
	
	function loadData(e) {
		if (e) {
			toSave = {
				date: e.date?.clone() ?? new DateOnly(),
				amount: new BigNumber(e.amount || 0),
				currency: e.currency || Currency.EUR,
				projectId: e.projectId,
			};
		} else {
			toSave = {
				date: new DateOnly(),
				amount: new BigNumber(0),
				currency: Currency.EUR,
				projectId: undefined,
			};
		}
	}
	
	$: entity, loadData(entity);
	
	</script>
	<Form {submitAsync}>
		<div uk-grid class="uk-grid-column-small uk-grid-row-collapse">
			<div class="uk-width-1-2">
				<DatePicker 
					value={toSave.date.toString()}
					on:change={({ target }) => toSave.date = target.value ? DateOnly.fromString(target.value) : new DateOnly()}
					label={__("Date")}
				/>
			</div>
			<div class="uk-width-1-2">
				<Autocomplete 
					label={__("Project")}
					value={toSave.projectId}
					on:change={({ detail }) => toSave.projectId = detail}
					options={$projects.map((p) => ({ value: p.id, label: p.name }))}
				/>
			</div>
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
				<Button type="submit">{__("Save")}</Button>
			</div>
		</div>
	</Form>
	