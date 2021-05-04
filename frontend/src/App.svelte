<script>
	import Layout from "./pages/_Layout.svelte";
	import Login from "./pages/Login.svelte";
	import { __ } from "./i18n";
	import { user } from "./DAL/user";
	import { init as initRouter } from "svelte-stack-router";
	import _routes from "./pages/_routes";
	import ServiceWorkerUpdater from "./components/ServiceWorkerUpdater.svelte";

	initRouter(_routes);

	$: userId = $user && $user.id;
</script>

{#if userId}
	<Layout />
{:else}
	<Login />
{/if}
<ServiceWorkerUpdater />
