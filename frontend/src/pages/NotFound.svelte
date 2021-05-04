<script>
	import { __ } from "../i18n";
	import { link } from "svelte-stack-router";
</script>

<div class="uk-position-center uk-text-center">
	<h1>{__('Pagina non trovata')}</h1>
	<a use:link class="uk-text-large" href="/">
		{__('Torna alla pagina iniziale')}
	</a>
</div>
