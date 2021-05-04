<script>
	import { Button, FormModal } from "custom-uikit-svelte";
	import { notifyErr } from "../helpers/notification";
	import { sleep } from "../helpers/time";
	import { __ } from "../i18n";
	import {
		showUpdateModal,
		updateCallback,
	} from "../startup/service-worker-updater";

	async function handleSubmit() {
		try {
			updateCallback();
			await sleep(60000);
		} catch (err) {
			console.error(err);
			notifyErr(
				__(
					"C'è stato un problema durante l'aggiornamento, puoi riprovare più tardi"
				)
			);
		}
	}
</script>

<FormModal
	bind:show={$showUpdateModal}
	title={__('Aggiornamento disponibile')}
	formSubmitAsync={handleSubmit}>
	<div>
		{__("È stato trovato un aggiornamento dell'App, puoi aggiornare adesso o rimandare a più tardi, l'aggiornamento richiederà pochi secondi.")}
	</div>
	<hr />
	<div class="uk-text-small">
		{__('N.B: Alcune funzionalità potrebbero non essere disponibili o non funzionare con la versione attualmente in esecuzione.')}
	</div>

	<div slot="footer" class="form-buttons">
		<Button
			type="button"
			className="cancel"
			on:click={() => ($showUpdateModal = false)}>
			{__('Non ora')}
		</Button>
		<Button type="submit">{__('Aggiorna')}</Button>
	</div>
</FormModal>
