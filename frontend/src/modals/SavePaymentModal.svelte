<script>
import { Modal } from 'custom-uikit-svelte';
import { createEventDispatcher } from 'svelte';
import PaymentForm from '../components/form/PaymentForm.svelte';
import { __ } from '../i18n';

export let entity = undefined;
export let show = false;

const dispatch = createEventDispatcher();

</script>
<Modal bind:show title={entity ? __("Update payment") : __("Add payment")}>
	<PaymentForm {entity} on:save={({ detail }) => (show = false, dispatch('save', detail))} />
</Modal>
