<script>
import { Modal } from 'custom-uikit-svelte';
import { createEventDispatcher } from 'svelte';
import TechnologyForm from '../components/form/TechnologyForm.svelte';
import { __ } from '../i18n';

export let entity = undefined;
export let show = false;

const dispatch = createEventDispatcher();

</script>
<Modal bind:show title={entity ? __("Update technology") : __("Add technology")}>
	<TechnologyForm {entity} on:save={({ detail }) => (show = false, dispatch('save', detail))} />
</Modal>
