<script>
	import Layout from "./pages/_Layout.svelte";
	import Login from "./pages/Login.svelte";
	import { __ } from "./i18n";
	import { user } from "./DAL/user";
	import ServiceWorkerUpdater from "./components/ServiceWorkerUpdater.svelte";

	$: userId = $user && $user.id;
</script>

{#if userId}
	<Layout />
{:else}
	<Login />
{/if}
<ServiceWorkerUpdater />
