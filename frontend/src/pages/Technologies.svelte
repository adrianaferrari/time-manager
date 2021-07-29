<script>
	import { Breadcrumb, Button, LoaderWrapper } from "custom-uikit-svelte";
import { push } from 'svelte-stack-router';
	import { technologies } from "../DAL/technology";
	import { __ } from "../i18n";
	import DeleteTechnologyModal from "../modals/DeleteTechnologyModal.svelte";
	import SaveTechnologyModal from "../modals/SaveTechnologyModal.svelte";
	import { Size, size } from "../ui-ux/responsive";

	const loading = technologies.refreshing;
	let showCreateModal = false;
	let showDeleteModal = false;
	let showUpdateModal = false;
	let selected = undefined;

	function select(e, entity) {
		e.stopPropagation();
		if (entity === selected) {
			selected = undefined;
		} else {
			selected = entity;
		}
	}
</script>

<svelte:body
	on:click={(e) => {
		if (!showDeleteModal && !showUpdateModal && !showCreateModal) {
			select(e, undefined);
		}
	}} />

<LoaderWrapper loading={$loading}>
	<Breadcrumb
		path={[{ label: __("Home"), href: '/#' }, { label: __('Technologies') }]} />
	<div class="uk-container">
		<div uk-grid class="uk-grid-small">
			<div class="uk-width-5-6@l uk-width-4-5@m uk-width-3-4">
				<div class="uk-flex uk-flex-wrap">
					{#each $technologies as technology}
						<Button
							className="uk-margin-right uk-margin-bottom"
							variant={selected === technology ? 'secondary' : 'default'}
							on:click={(e) => select(e, technology)}>
							{technology.name}
						</Button>
					{/each}
				</div>
			</div>
			<div class="uk-width-1-6@l uk-width-1-5@m uk-width-1-4">
				<div>
					<Button
						className="uk-width-1-1@s"
						variant="primary"
						icon="plus"
						on:click={(e) => (e.stopPropagation(), (showCreateModal = true))}>
						{$size > Size.xs ? __('New') : ''}
					</Button>
					<Button
						className="uk-width-1-1@s uk-margin-small-top"
						disabled={!selected}
						variant="secondary"
						icon="forward"
						on:click={(e) => (e.stopPropagation(), push(`/technology/details/${selected.id}`))}>
						{$size > Size.xs ? __('Details') : ''}
					</Button>
					<Button
						className="uk-width-1-1@s uk-margin-small-top"
						disabled={!selected}
						variant="primary"
						icon="pencil"
						on:click={(e) => (e.stopPropagation(), (showUpdateModal = true))}>
						{$size > Size.xs ? __('Edit') : ''}
					</Button>
					<Button
						className="uk-width-1-1@s uk-margin-small-top"
						disabled={!selected}
						variant="danger"
						icon="trash"
						on:click={(e) => (e.stopPropagation(), (showDeleteModal = true))}>
						{$size > Size.xs ? __('Delete') : ''}
					</Button>
				</div>
			</div>
		</div>
	</div>
</LoaderWrapper>

<SaveTechnologyModal bind:show={showCreateModal} />

<SaveTechnologyModal bind:show={showUpdateModal} entity={selected} />

<DeleteTechnologyModal bind:show={showDeleteModal} entity={selected} on:delete={() => selected = undefined} />
