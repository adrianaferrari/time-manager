<script>
import { Autocomplete, Button, EmailInput, Form, TextInput } from 'custom-uikit-svelte';
import { createEventDispatcher } from 'svelte';
import { companies, save } from '../../DAL/company';
import { statusMatch } from '../../helpers/axios';
import { notifyErr, notifySuccess } from '../../helpers/notification';
import { HttpStatus } from '../../http/status';
import { __ } from '../../i18n';

/** @type {import('../../DAL/client').Client | null } */
export let entity = undefined;

const dispatch = createEventDispatcher();

let toSave = {
	name: '',
	vatNumber: undefined,
	email: undefined,
}

async function submitAsync() {
	try {
		const company = await save(toSave, entity?.id);
		notifySuccess(__("Company saved"));
		loadData(entity);
		dispatch('save', company);
		await clients.refresh();
	} catch (err) {
		statusMatch(err, {
			[HttpStatus.Forbidden]: () => notifyErr(__("You're not authorised to edit this company")),
			[HttpStatus.Conflict]: () => notifyErr(__("A company with this email or vat number already exists"))
		});
	}
}

function loadData(e) {
	if (e) {
		toSave = {
			name: e.name,
			vatNumber: e.vatNumber,
			email: e.email,
		}
	} else {
		toSave = {
			name: '',
			vatNumber: undefined,
			email: undefined,
		}
	}
}

$: entity, loadData(entity);

</script>
<Form {submitAsync}>
	<div uk-grid class="uk-grid-column-small uk-grid-row-collapse">
		<div class="uk-width-1-1">
			<TextInput 
				maxlength={150}
				minlength={1}
				value={toSave.name}
				on:change={({ target }) => toSave.name = target.value.trim()}
				label={__("Name")}
			/>
		</div>
		<div class="uk-width-1-2">
			<EmailInput 
				value={toSave.email}
				optional
				maxlength={150}
				on:change={({ target }) => toSave.email = target.value.trim()}
				label={__("Email")}
			/>
		</div>
		<div class="uk-width-1-2">
			<TextInput 
				optional
				value={toSave.vatNumber}
				maxlength={100}
				on:change={({ target }) => toSave.vatNumber = target.value.trim()}
				label={__("VAT number")}
			/>
		</div>
		<div class="uk-width-1-1 uk-text-center">
			<Button type="submit">{__('Save')}</Button>
		</div>
	</div>
</Form>
