<script>
import { Button, LoaderWrapper } from 'custom-uikit-svelte';
import { technologies } from '../DAL/technology';
import { __ } from '../i18n';
import SaveTechnologyModal from '../modals/SaveTechnologyModal.svelte';

const loading = technologies.refreshing;
let showCreateModal = false;

</script>
<LoaderWrapper loading={$loading}>
	{#each $technologies as technology}
		<p>{technology.name}</p>
	{/each}
	<Button icon="plus" on:click={() => showCreateModal = true}>{__("New")}</Button>
</LoaderWrapper>

<SaveTechnologyModal
	bind:show={showCreateModal}
/>
