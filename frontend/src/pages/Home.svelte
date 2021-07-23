<script>
import { Breadcrumb, Button } from 'custom-uikit-svelte';
import { push } from 'svelte-stack-router';
import { __ } from '../i18n';

</script>
<Breadcrumb
	path={[{ label: __('Home') }]} />
<Button on:click={() => push('/activity/all')}>{__("Activities")}</Button>
<Button on:click={() => push('/category/all')}>{__("Categories")}</Button>
<Button on:click={() => push('/project/all')}>{__("Projects")}</Button>
<Button on:click={() => push('/technology/all')}>{__("Technologies")}</Button>
