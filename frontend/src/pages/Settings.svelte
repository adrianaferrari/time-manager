<script>
import { Breadcrumb, Button, Card, Form, LoaderWrapper, NumberInput } from 'custom-uikit-svelte';

import { saveSettings, userSettings } from '../DAL/user';
import { statusMatch } from '../helpers/axios';
import { notifySuccess } from '../helpers/notification';
import { __ } from '../i18n';

let toSave = {
	dayLength: 8,
};

let loading = false;
async function submitAsync() {
	loading = true;
	try {
		await saveSettings({ dayLength: toSave.dayLength });
		notifySuccess(__("Your settings have been updated"));
		await userSettings.refresh();
	} catch (err) {
		statusMatch(err); 
	}	finally {
		loading = false;
	}
}

function loadData() {
	if ($userSettings) {
		toSave = { dayLength: $userSettings.dayLength };
	} else {
		toSave = { dayLength: 8 };
	}
}
$: $userSettings, loadData();
</script>

<LoaderWrapper {loading}>
	<Breadcrumb path={[{ label: __("Settings") }]} />
	<Card className="uk-width-3-4@l uk-width-4-5@m uk-width-5-6 uk-margin-auto">
		<Form {submitAsync}>
			<div class="uk-grid-column-small uk-grid-collapse">
				<div class="uk-width-1-2@s uk-width-1-1">
					<NumberInput 
						label={__("Hours in a workday")}
						value={toSave.dayLength}
						on:change={({ target }) => toSave.dayLength = target.value}
						min={0.5}
						max={24}
						step={0.5}
					/>
				</div>
			</div>
			<div class="uk-text-center">
				<Button type="submit">{__("Update settings")}</Button>
			</div>
		</Form>
	</Card>
</LoaderWrapper>
