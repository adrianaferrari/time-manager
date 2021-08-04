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

<footer>
	<div class="uk-padding uk-text-center">
		<span class="uk-text-small">
			<span class="uk-text-primary uk-text-bold">Time Manager</span> by Adriana Ferrari © 2021
		</span>
	</div>
</footer>
