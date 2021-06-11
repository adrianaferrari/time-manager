<script>
import { createEventDispatcher } from 'svelte';

import IconButton from './IconButton.svelte';

	export let actions = [];

	const dispatch = createEventDispatcher();
</script>

<div class="card-actions">
	{#each actions as action}
		<IconButton
			className="uk-margin-small-bottom"
			icon={action.icon}
			tooltip={action.tooltip}
			on:click={() => dispatch(action.name)}
		/>
	{/each}
</div>
