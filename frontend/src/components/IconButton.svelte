<script>
	export let icon = undefined;
	export let className = undefined;
	export let style = undefined;
	export let tooltip = undefined;
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<!-- svelte-ignore a11y-missing-content -->
<a role="button" uk-tooltip={tooltip} class:uk-icon-button={true} class={className} {style} uk-icon={icon} on:click />
