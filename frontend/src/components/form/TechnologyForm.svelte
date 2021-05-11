<script>
import { Button, Form, TextInput } from 'custom-uikit-svelte';
import { createEventDispatcher } from 'svelte';
import { save, technologies } from '../../DAL/technology';
import { statusMatch } from '../../helpers/axios';
import { notifyErr, notifySuccess } from '../../helpers/notification';
import { HttpStatus } from '../../http/status';
import { __ } from '../../i18n';

/** @type {import('../../DAL/technology').Technology | null } */
export let entity = undefined;

const dispatch = createEventDispatcher();

let name = '';

async function submitAsync() {
	try {
		const technology = await save({ name }, entity?.id);
		notifySuccess(__("Technology saved"));
		loadData(entity);
		dispatch('save', technology);
		await technologies.refresh();
	} catch (err) {
		statusMatch(err, {
			[HttpStatus.Forbidden]: () => notifyErr(__("You're not authorised to edit this technology")),
			[HttpStatus.Conflict]: () => notifyErr(__("A technology with this name already exists"))
		});
	}
}

function loadData(e) {
	if (e) {
		name = e.name;
	} else {
		name = '';
	}
}

$: entity, loadData(entity);

</script>
<Form {submitAsync}>
	<TextInput value={name} on:change={({ target }) => name = target.value} label={__("Name")} />
	<Button type="submit">{__("Save")}</Button>
</Form>
