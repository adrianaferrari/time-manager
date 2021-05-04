import './startup';
import App from './App.svelte';
import './style/main.scss';

const app = new App({
	target: document.body,
	props: {},
});

export default app;
