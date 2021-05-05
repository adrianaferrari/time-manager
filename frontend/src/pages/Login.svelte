<script>
import { Button, EmailInput, Form, PasswordInputAlt } from 'custom-uikit-svelte';
import * as user from '../DAL/user';
import { statusMatch } from '../helpers/axios';
import { __ } from '../i18n';

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
<Form submitAsync={login}>
	<EmailInput 
		bind:value={email}
		label={__("Email")}
		name="email"
		requiredMarker=""
	/>
	<PasswordInputAlt 
		bind:value={password}
		label={"Password"}
		name="password"
		requiredMarker=""
	/>
	<Button type="submit">{__("Login")}</Button>
</Form>
