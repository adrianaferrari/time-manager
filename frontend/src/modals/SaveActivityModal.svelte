<script>
import { Modal } from 'custom-uikit-svelte';
import { createEventDispatcher } from 'svelte';
import ActivityForm from '../components/form/ActivityForm.svelte';
import { __ } from '../i18n';

export let entity = undefined;
export let show = false;

const dispatch = createEventDispatcher();

</script>
<Modal bind:show title={(entity && entity.id) ? __("Update activity") : __("Add activity")}>
	<ActivityForm {entity} on:save={({ detail }) => (show = false, dispatch('save', detail))} />
</Modal>
