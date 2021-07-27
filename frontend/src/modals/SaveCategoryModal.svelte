<script>
import { Modal } from 'custom-uikit-svelte';
import { createEventDispatcher } from 'svelte';
import CategoryForm from '../components/form/CategoryForm.svelte';
import { __ } from '../i18n';

export let entity = undefined;
export let show = false;

const dispatch = createEventDispatcher();
</script>
<Modal bind:show title={entity ? __("Update category") : __("Add category")}>
	<CategoryForm {entity} on:save={({ detail }) => (show = false, dispatch('save', detail))} />
</Modal>
