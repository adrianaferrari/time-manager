<script>
import { __ } from '../i18n';
import { link, location } from 'svelte-stack-router';
import { Size, size } from '../ui-ux/responsive';
import Anchor from './Anchor.svelte';

	const entries = [
		{ label: __("Activities"), href: "/activity/all" },
		{ label: __("Categories"), href: "/category/all" },
		{ label: __("Clients"), href: "/client/all" },
		{ label: __("Companies"), href: "/company/all" },
		{ label: __("Payments"), href: "/payment/all" },
		{ label: __("Projects"), href: "/project/all" },
		{ label: __("Stats"), href: "/stats" },
		{ label: __("Technologies"), href: "/technology/all" },
	]
</script>

<nav class="uk-navbar-container" uk-navbar>
	<div class="uk-navbar-left">
			<ul class="uk-navbar-nav">
					<li class:uk-active={$location === '/'}>
						<a href="/" class="uk-navbar-item uk-logo">
							<img src="assets/img/logo/64.png" />
						</a>
					</li>
			</ul>
	</div>
	<div class="uk-navbar-right">
		<ul class="uk-navbar-nav">
			{#if $size > Size.m}
				{#each entries as entry}
					<li class:uk-active={$location.startsWith(entry.href.replace('/all', ''))}><a href={entry.href} use:link>{entry.label}</a></li>
				{/each}
			{:else}
				<li>
					<a role="button">{__("Menu")}</a>
					<div class="uk-navbar-dropdown">
						<ul class="uk-nav uk-navbar-dropdown-nav">
							{#each entries as entry}
								<li class:uk-active={$location.startsWith(entry.href)}><a href={entry.href} use:link>{entry.label}</a></li>
							{/each}
						</ul>
					</div>
				</li>
			{/if}
			<li class:uk-active={$location === '/'}>
				<Anchor href="/"><span uk-icon="home"/></Anchor>
			</li>
			<li class:uk-active={$location.startsWith('/settings')}>
				<Anchor href="/settings"><span uk-icon="cog"/></Anchor>
			</li>
		</ul>
	</div>
</nav>
