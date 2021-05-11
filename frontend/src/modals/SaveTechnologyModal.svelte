<script>
import { Modal } from 'custom-uikit-svelte';
import TechnologyForm from '../components/form/TechnologyForm.svelte';
import { __ } from '../i18n';

export let entity = undefined;
export let show = false;

</script>
<Modal bind:show title={entity ? __("Update technology") : __("Add technology")}>
	<TechnologyForm {entity} on:save={() => show = false} />
</Modal>
