<script>

import { slide, StackRouter } from "svelte-stack-router";
import Navbar from '../components/Navbar.svelte';
	import { __ } from "../i18n";
import routes from './_routes';
</script>

<Navbar />
<main>
	<StackRouter {routes} transitionFn={slide(300)}/>
</main>

<footer />
