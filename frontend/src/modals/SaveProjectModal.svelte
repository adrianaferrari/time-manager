<script>
import { Modal } from 'custom-uikit-svelte';
import { createEventDispatcher } from 'svelte';
import ProjectForm from '../components/form/ProjectForm.svelte';
import { __ } from '../i18n';

export let entity = undefined;
export let show = false;

const dispatch = createEventDispatcher();

</script>
<Modal bind:show title={entity ? __("Update project") : __("Add project")}>
	<ProjectForm {entity} on:save={() => (show = false)} />
</Modal>
