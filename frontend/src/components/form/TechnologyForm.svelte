<script>
import { Button, Form, TextInput } from 'custom-uikit-svelte';
import { createEventDispatcher } from 'svelte';
import { save, technologies } from '../../DAL/technology';
import { statusMatch } from '../../helpers/axios';
import { notifySuccess } from '../../helpers/notification';
import { __ } from '../../i18n';

/** @type {import('../../DAL/technology').Technology | null } */
export let entity = undefined;

const dispatch = createEventDispatcher();

let name = '';

async function submitAsync() {
	try {
		const technology = await save({ name }, entity?.id);
		notifySuccess(__("Technology saved"));
		loadData();
		dispatch('save', technology);
		await technologies.refresh();
	} catch (err) {
		statusMatch(err);
	}
}

function loadData() {
	if (entity) {
		name = entity.name;
	} else {
		name = '';
	}
}

$: entity, loadData();

</script>
<Form {submitAsync}>
	<TextInput bind:value={name} label={__("Name")} />
	<Button type="submit">{__("Save")}</Button>
</Form>
