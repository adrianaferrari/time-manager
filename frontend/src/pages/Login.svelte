<script>
	import {
		Button,
		Card,
		EmailInput,
		Form,
		PasswordInputAlt,
	} from "custom-uikit-svelte";
	import * as user from "../DAL/user";
	import { statusMatch } from "../helpers/axios";
	import { __ } from "../i18n";

	let email = "";
	let password = "";

	async function login() {
		try {
			await user.login(email, password);
		} catch (err) {
			statusMatch(err);
		}
	}
</script>

<div class="uk-container">
	<Card
		className="uk-width-2-3@l uk-width-3-4@m uk-width-4-5@s uk-width-5-6 uk-margin-auto uk-margin-large-top">
		<Form submitAsync={login}>
			<div class="uk-text-center"><img src="assets/img/logo/128.png" /></div>
			<EmailInput
				bind:value={email}
				label={__('Email')}
				name="email"
				requiredMarker="" />
			<PasswordInputAlt
				bind:value={password}
				label={'Password'}
				name="password"
				requiredMarker="" />
			<div class="uk-text-center">
				<Button type="submit">{__('Login')}</Button>
			</div>
		</Form>
	</Card>
</div>
