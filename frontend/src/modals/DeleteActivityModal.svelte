<script>
	import { Button, FormModal } from "custom-uikit-svelte";
import { createEventDispatcher } from 'svelte';
	import { del } from "../DAL/activity";
import { statusMatch } from '../helpers/axios';
	import { notifyErr, notifySuccess } from "../helpers/notification";
import { HttpStatus } from '../http/status';
	import { __ } from "../i18n";

	export let entity = undefined;
	export let show = false;

	const dispatch = createEventDispatcher();

	async function formSubmitAsync() {
		try {
			await del(entity.id);
			show = false;
			dispatch('delete', entity);
			notifySuccess(__("Activity deleted"));
		} catch (err) {
			statusMatch(err, {
				[HttpStatus.Forbidden]: () =>
					notifyErr(__("You're not authorised to delete this activity")),
			});
		}
	}
</script>

<FormModal bind:show {formSubmitAsync} title={__('Confirm action')}>
	{#if entity}
		<p>
			{__(
				'Are you sure you want to delete ":description" from your list of activities?',
				entity
			)}
		</p>
		<div class="uk-flex uk-flex-end" />
	{/if}

	<div slot="footer" on:click|stopPropagation>
		<Button
			className="uk-margin-right"
			type="button"
			on:click={() => (show = false)}>
			{__('Cancel')}
		</Button>
		<Button variant="danger" type="submit">{__('Delete')}</Button>
	</div>
</FormModal>
