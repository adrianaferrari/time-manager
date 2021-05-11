<script>
import { __ } from '../i18n';
import { link, location } from 'svelte-stack-router';

	const entries = [
		{ label: __("Activities"), href: "/activity/all" },
		{ label: __("Categories"), href: "/category/all" },
		{ label: __("Clients"), href: "/client/all" },
		{ label: __("Companies"), href: "/company/all" },
		{ label: __("Payments"), href: "/payment/all" },
		{ label: __("Projects"), href: "/project/all" },
		{ label: __("Technologies"), href: "/technology/all" },
	]
</script>

<nav class="uk-navbar-container" uk-navbar>
	<div class="uk-navbar-left">
			<ul class="uk-navbar-nav">
					<li class="uk-active"><a href=""></a></li>
					<li class="uk-parent"><a href=""></a></li>
					<li><a href=""></a></li>
			</ul>
	</div>
	<div class="uk-navbar-right">
		<ul class="uk-navbar-nav">
			{#each entries as entry}
				<li class:uk-active={$location.startsWith(entry.href)}><a href={entry.href} use:link>{entry.label}</a></li>
			{/each}
		</ul>
	</div>
</nav>
