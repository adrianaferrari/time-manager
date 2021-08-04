<script>
	import { Breadcrumb, Button, Card, LoaderWrapper } from "custom-uikit-svelte";
	import { push } from "svelte-stack-router";
	import { categories } from "../DAL/category";
	import { __ } from "../i18n";
	import DeleteCategoryModal from "../modals/DeleteCategoryModal.svelte";
	import SaveCategoryModal from "../modals/SaveCategoryModal.svelte";
	import { Size, size } from "../ui-ux/responsive";

	const loading = categories.refreshing;
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
		path={[{ label: __('Home'), href: '/#' }, { label: __('Categories') }]} />
	<div class="uk-container">
		<Card>
			<div uk-grid class="uk-grid-small">
				<div class="uk-width-5-6@l uk-width-4-5@m uk-width-3-4">
					<legend class="uk-text-italic uk-margin-small-bottom">
						{__('Click on a category to edit it, delete it or go to its details page.')}
					</legend>
					<div class="uk-flex uk-flex-wrap">
						{#each $categories as category}
							<Button
								className="uk-margin-right uk-margin-bottom"
								variant={selected === category ? 'secondary' : 'default'}
								on:click={(e) => select(e, category)}>
								{category.name}
							</Button>
						{/each}
					</div>
				</div>
				<div class="uk-width-1-6@l uk-width-1-5@m uk-width-1-4">
					<div>
						<Button
							className="uk-width-1-1@s"
							variant="secondary"
							icon="plus"
							on:click={(e) => (e.stopPropagation(), (showCreateModal = true))}>
							{$size > Size.xs ? __('New') : ''}
						</Button>
						<Button
							className="uk-width-1-1@s uk-margin-small-top"
							disabled={!selected}
							variant="primary"
							icon="forward"
							on:click={(e) => (e.stopPropagation(), push(`/category/details/${selected.id}`))}>
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
		</Card>
	</div>
</LoaderWrapper>

<SaveCategoryModal bind:show={showCreateModal} />

<SaveCategoryModal bind:show={showUpdateModal} entity={selected} />

<DeleteCategoryModal
	bind:show={showDeleteModal}
	entity={selected}
	on:delete={() => (selected = undefined)} />
