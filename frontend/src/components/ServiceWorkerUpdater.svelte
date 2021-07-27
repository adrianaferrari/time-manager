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
	title={__('Update available')}
	formSubmitAsync={handleSubmit}>
	<div>
		{__("There is an update for this application, you can download it now or wait until later. The update will only take a few seconds.")}
	</div>
	<hr />
	<div class="uk-text-small">
		{__('N.B: Some features might not be available or working with the current version.')}
	</div>

	<div slot="footer" class="form-buttons">
		<Button
			type="button"
			className="cancel"
			on:click={() => ($showUpdateModal = false)}>
			{__('Not now')}
		</Button>
		<Button type="submit">{__('Update')}</Button>
	</div>
</FormModal>
