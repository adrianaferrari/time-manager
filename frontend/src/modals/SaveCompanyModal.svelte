<script>
import { Modal } from 'custom-uikit-svelte';
import { createEventDispatcher } from 'svelte';
import CompanyForm from '../components/form/CompanyForm.svelte';
import { __ } from '../i18n';

export let entity = undefined;
export let show = false;

const dispatch = createEventDispatcher();

</script>
<Modal bind:show title={entity ? __("Update company") : __("Add company")}>
	<CompanyForm {entity} on:save={({ detail }) => (show = false, dispatch('save', detail))} />
</Modal>
