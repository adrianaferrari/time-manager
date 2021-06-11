<script>
import { Modal } from 'custom-uikit-svelte';
import { createEventDispatcher } from 'svelte';
import ClientForm from '../components/form/ClientForm.svelte';
import { __ } from '../i18n';

export let entity = undefined;
export let show = false;

const dispatch = createEventDispatcher();

</script>
<Modal bind:show title={entity ? __("Update client") : __("Add client")}>
	<ClientForm {entity} on:save={() => (show = false)} />
</Modal>
