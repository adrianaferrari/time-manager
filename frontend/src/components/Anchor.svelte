<script>
	import { link } from 'svelte-stack-router';

	export let href;
	export let className = "";
	export let ref = undefined;
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<a bind:this={ref} use:link={href} class={className} on:click><slot /></a>
