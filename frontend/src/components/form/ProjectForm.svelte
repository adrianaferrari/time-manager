<script>
import { DateOnly } from '@cdellacqua/date-only';
import BigNumber from 'bignumber.js';

	import { Button, Form, TextInput } from 'custom-uikit-svelte';
	import { createEventDispatcher } from 'svelte';
	import { save, projects } from '../../DAL/project';
	import { statusMatch } from '../../helpers/axios';
	import { notifySuccess } from '../../helpers/notification';
	import { __ } from '../../i18n';
	
	/** @type {import('../../DAL/project').Project | null } */
	export let entity = undefined;
	
	const dispatch = createEventDispatcher();
	
	/** @type {import('../../DAL/project').SaveProject}*/
	let toSave = {
		name: '',
		startDate: new DateOnly(),
		clientId: undefined,
		currency: null,
		endDate: null,
		estimatedEffort: null,
		price: null,
		technologyIds: [],
	};
	
	async function submitAsync() {
		try {
			const project = await save(toSave, entity?.id);
			notifySuccess(__("Project saved"));
			loadData();
			dispatch('save', project);
			await projects.refresh();
		} catch (err) {
			statusMatch(err);
		}
	}
	
	function loadData() {
		if (entity) {
			toSave = {
				name: entity.name,
				startDate: entity.startDate.clone(),
				clientId: entity.clientId,
				currency: entity.currency,
				endDate: entity.endDate?.clone(),
				estimatedEffort: entity.estimatedEffort?.clone(),
				price: entity.price ? new BigNumber(entity.price) : null,
				technologyIds: entity.technologyIds,
			};
		} else {
			toSave = {
				name: '',
				startDate: new DateOnly(),
				clientId: undefined,
				currency: null,
				endDate: null,
				estimatedEffort: null,
				price: null,
				technologyIds: [],
			};
		}
	}
	
	$: entity, loadData();
	
	</script>
	<Form {submitAsync}>
		<Button type="submit">{__("Save")}</Button>
	</Form>
	