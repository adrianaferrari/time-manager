<script>
import { Button } from 'custom-uikit-svelte';
import { push } from 'svelte-stack-router';
import { __ } from '../i18n';

</script>
<Button on:click={push('/activity/all')}>{__("Activities")}</Button>
