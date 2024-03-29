<script>
import { Autocomplete, Button, EmailInput, Form, TextInput } from 'custom-uikit-svelte';
import { createEventDispatcher, tick } from 'svelte';
import { clients, save } from '../../DAL/client';
import { companies } from '../../DAL/company';
import { statusMatch } from '../../helpers/axios';
import { notifyErr, notifySuccess } from '../../helpers/notification';
import { HttpStatus } from '../../http/status';
import { __ } from '../../i18n';
import SaveCompanyModal from '../../modals/SaveCompanyModal.svelte';
import IconButton from '../IconButton.svelte';

/** @type {import('../../DAL/client').Client | null } */
export let entity = undefined;

const dispatch = createEventDispatcher();

let toSave = {
	firstName: '',
	lastName: '',
	email: undefined,
	companyId: undefined,
}

async function submitAsync() {
	try {
		const client = await save(toSave, entity?.id);
		notifySuccess(__("Client saved"));
		loadData(entity);
		await clients.refresh();
		dispatch('save', client);
	} catch (err) {
		statusMatch(err, {
			[HttpStatus.Forbidden]: () => notifyErr(__("You're not authorised to edit this client")),
			[HttpStatus.Conflict]: () => notifyErr(__("A client with this email already exists"))
		});
	}
}

function loadData(e) {
	if (e) {
		toSave = {
			firstName: e.firstName,
			lastName: e.lastName,
			email: e.email,
			companyId: e.companyId,
		}
	} else {
		toSave = {
			firstName: '',
			lastName: '',
			email: undefined,
			companyId: undefined,
		}
	}
}

let showCompanyCreationModal = false;
	function createNewCompany() {
		showCompanyCreationModal = true;
	}

$: entity, loadData(entity);

</script>
<Form {submitAsync}>
	<div uk-grid class="uk-grid-column-small uk-grid-row-collapse">
		<div class="uk-width-1-2@s uk-width-1-1">
			<EmailInput 
				value={toSave.email}
				maxlength={150}
				optional
				on:change={({ target }) => toSave.email = target.value.trim()}
				label={__("Email")}
			/>
		</div>
		<div class="uk-width-1-2@s uk-width-1-1 uk-flex uk-flex-bottom">
			<Autocomplete 
				label={__("Company")}
				style="flex: 1;"
				optional
				options={$companies.map((c) => ({ value: c.id, label: c.name }))}
				value={toSave.companyId}
				on:change={({ detail }) => toSave.companyId = detail}
			/>
			<span>
				<IconButton
					className="uk-margin-bottom uk-margin-small-left"
					on:click={() => createNewCompany()}
					icon="plus" />
			</span>
		</div>
		<div class="uk-width-1-2@s uk-width-1-1">
			<TextInput 
				value={toSave.firstName}
				minlength={1}
				maxlength={100}
				on:change={({ target }) => toSave.firstName = target.value.trim()}
				label={__("First name")}
			/>
		</div>
		<div class="uk-width-1-2@s uk-width-1-1">
			<TextInput 
				minlength={1}
				maxlength={100}
				value={toSave.lastName}
				on:change={({ target }) => toSave.lastName = target.value.trim()}
				label={__("Last name")}
			/>
		</div>
		<div class="uk-width-1-1 uk-text-center">
			<Button type="submit">{__('Save')}</Button>
		</div>
	</div>
</Form>

<SaveCompanyModal 
	bind:show={showCompanyCreationModal}
	on:save={({ detail }) => tick().then((_) => (toSave.companyId = detail.id))} />
