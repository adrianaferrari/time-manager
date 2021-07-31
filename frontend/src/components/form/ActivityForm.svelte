<script>
	import { DateOnly } from "@cdellacqua/date-only";
	import { Interval } from "@cdellacqua/interval";

	import {
		Autocomplete,
		Button,
		DatePicker,
		Form,
		NumberInput,
		Textarea,
		TimePicker,
	} from "custom-uikit-svelte";
	import { createEventDispatcher, tick } from "svelte";
	import { save } from "../../DAL/activity";
	import { categories } from "../../DAL/category";
	import { projects } from "../../DAL/project";
	import { statusMatch } from "../../helpers/axios";
	import { notifyErr, notifySuccess } from "../../helpers/notification";
	import { HttpStatus } from "../../http/status";
	import { __ } from "../../i18n";
	import SaveCategoryModal from "../../modals/SaveCategoryModal.svelte";
	import SaveProjectModal from "../../modals/SaveProjectModal.svelte";
	import IconButton from "../IconButton.svelte";

	/** @type {import('../../DAL/activity').Activity | null } */
	export let entity = undefined;

	const dispatch = createEventDispatcher();

	/** @type {import('../../DAL/activity').SaveActivity}*/
	let toSave = {
		categoryId: undefined,
		date: new DateOnly(),
		description: "",
		timeSpent: new Interval(0),
		projectId: undefined,
	};

	async function submitAsync() {
		try {
			const activity = await save(toSave, entity?.id);
			notifySuccess(__("Activity saved"));
			loadData(entity);
			dispatch("save", activity);
		} catch (err) {
			statusMatch(err, {
				[HttpStatus.Forbidden]: () =>
					notifyErr(__("You're not authorised to edit this activity")),
			});
		}
	}

	function loadData(
		/** @type {import('../../DAL/activity').Activity | undefined} */ e
	) {
		if (e) {
			toSave = {
				categoryId: e.categoryId,
				date: e.date?.clone() ?? new DateOnly(),
				description: e.description ?? "",
				timeSpent: e.timeSpent?.clone() ?? new Interval(0),
				projectId: e.projectId,
			};
		} else {
			toSave = {
				categoryId: undefined,
				date: new DateOnly(),
				description: "",
				timeSpent: new Interval(0),
				projectId: undefined,
			};
		}
	}

	let showCategoryCreationModal = false;
	let showProjectCreationModal = false;
	function createNewCategory() {
		showCategoryCreationModal = true;
	}
	function createNewProject() {
		showProjectCreationModal = true;
	}

	$: entity, loadData(entity);
</script>

<Form {submitAsync}>
	<div uk-grid class="uk-grid-column-small uk-grid-row-collapse">
		<div class="uk-width-1-2@m uk-width-1-1">
			<DatePicker
				label={__('Date')}
				value={toSave.date.toString()}
				on:change={({ target }) => (toSave.date = target.value ? DateOnly.fromString(target.value) : new DateOnly())} />
		</div>
		<div class="uk-width-1-4@m uk-width-1-2">
			<NumberInput
				label={__('Hours')}
				value={toSave.timeSpent.h}
				max={23}
				min={0}
				step={1}
				on:change={({ target }) => (toSave.timeSpent = toSave.timeSpent
						.sub(toSave.timeSpent.h + ':00:00')
						.add(target.value + ':00:00'))} />
		</div>
		<div class="uk-width-1-4@m uk-width-1-2">
			<NumberInput
				label={__('Minutes')}
				max={59}
				min={toSave.timeSpent.h > 0 ? 0 : 1}
				step={1}
				value={toSave.timeSpent.m}
				on:change={({ target }) => (toSave.timeSpent = toSave.timeSpent
						.sub(toSave.timeSpent.m + ':00')
						.add(target.value + ':00'))} />
		</div>
		<div class="uk-width-1-2@s uk-width-1-1 uk-flex uk-flex-bottom">
			<Autocomplete
				style="flex: 1;"
				label={__('Category')}
				options={$categories.map((c) => ({ label: c.name, value: c.id }))}
				value={toSave.categoryId}
				on:change={({ detail }) => (toSave.categoryId = detail)} />
			<span>
				<IconButton
					className="uk-margin-bottom uk-margin-small-left"
					on:click={() => createNewCategory()}
					icon="plus" />
			</span>
		</div>
		<div class="uk-width-1-2@s uk-width-1-1 uk-flex uk-flex-bottom">
			<Autocomplete
				label={__('Project')}
				style="flex: 1;"
				options={$projects.map((p) => ({ label: p.name, value: p.id }))}
				value={toSave.projectId}
				optional
				on:change={({ detail }) => (toSave.projectId = detail)} />
			<span>
				<IconButton
					className="uk-margin-bottom uk-margin-small-left"
					on:click={() => createNewProject()}
					icon="plus" />
			</span>
		</div>
		<div class="uk-width-1-1">
			<Textarea
				label={__('Description')}
				minlength={1}
				maxlength={1000}
				value={toSave.description}
				on:change={({ target }) => (toSave.description = target.value)} />
		</div>
		<div class="uk-width-1-1 uk-text-center">
			<Button type="submit">{__('Save')}</Button>
		</div>
	</div>
</Form>

<SaveCategoryModal
	bind:show={showCategoryCreationModal}
	on:save={({ detail }) => tick().then((_) => (toSave.categoryId = detail.id))} />

<SaveProjectModal
	bind:show={showProjectCreationModal}
	on:save={({ detail }) => tick().then((_) => (toSave.projectId = detail.id))} />
