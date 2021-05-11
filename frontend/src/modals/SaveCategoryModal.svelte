<script>
import { Modal } from 'custom-uikit-svelte';
import CategoryForm from '../components/form/CategoryForm.svelte';
import { __ } from '../i18n';

export let entity = undefined;
export let show = false;

</script>
<Modal bind:show title={entity ? __("Update category") : __("Add category")}>
	<CategoryForm {entity} on:save={() => show = false} />
</Modal>
