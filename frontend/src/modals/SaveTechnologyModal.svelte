<script>
import { Modal } from 'custom-uikit-svelte';
import TechnologyForm from '../components/form/TechnologyForm.svelte';

export let entity = undefined;
export let show = false;

</script>
<Modal bind:show>
	<TechnologyForm {entity} on:save={() => show = false} />
</Modal>
