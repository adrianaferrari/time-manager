<script>
	import { Button, FormModal } from "custom-uikit-svelte";
import { createEventDispatcher } from 'svelte';
	import { del, categories } from "../DAL/category";
	import { notifyErr, notifySuccess } from "../helpers/notification";
	import { __ } from "../i18n";

	export let entity = undefined;
	export let show = false;

	const dispatch = createEventDispatcher();

	async function formSubmitAsync() {
		try {
			await del(entity.id);
			show = false;
			await categories.refresh();
			dispatch('delete', entity);
			notifySuccess(__("Category deleted"));
		} catch (err) {
			statusMatch(err, {
				[HttpStatus.Forbidden]: () =>
					notifyErr(__("You're not authorised to delete this category")),
			});
		}
	}
</script>

<FormModal bind:show {formSubmitAsync} title={__('Confirm action')}>
	{#if entity}
		<p>
			{__(
				'Are you sure you want to delete :name from your list of categories?',
				{ name: entity.name }
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
