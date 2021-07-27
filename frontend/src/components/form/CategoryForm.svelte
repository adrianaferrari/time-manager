<script>
import { Button, Form, TextInput } from 'custom-uikit-svelte';
import { createEventDispatcher } from 'svelte';
import { save, categories } from '../../DAL/category';
import { statusMatch } from '../../helpers/axios';
import { notifySuccess } from '../../helpers/notification';
import { HttpStatus } from '../../http/status';
import { __ } from '../../i18n';

/** @type {import('../../DAL/category').Category | null } */
export let entity = undefined;

const dispatch = createEventDispatcher();

let name = '';

async function submitAsync() {
	try {
		const category = await save({ name }, entity?.id);
		notifySuccess(__("Category saved"));
		loadData();
		await categories.refresh();
		dispatch('save', category);
	} catch (err) {
		statusMatch(err, {
			[HttpStatus.Forbidden]: () => notifyErr(__("You're not authorised to edit this category")),
			[HttpStatus.Conflict]: () => notifyErr(__("A category with this name already exists"))
		});
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
	<TextInput bind:value={name} label={__("Name")} maxlength={100} />
	<Button type="submit">{__("Save")}</Button>
</Form>
