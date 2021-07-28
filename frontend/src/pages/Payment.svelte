<script>
	import { Breadcrumb, Card, LoaderWrapper } from "custom-uikit-svelte";
	import { onMount } from "svelte";

	import { pop, setResumable } from "svelte-stack-router";
	import Anchor from "../components/Anchor.svelte";
import CardActions from '../components/CardActions.svelte';
import IconButton from '../components/IconButton.svelte';
import { clients } from '../DAL/client';
	import { get } from "../DAL/payment";
	import { projects } from "../DAL/project";
import { dayLength } from '../DAL/user';
	import { statusMatch } from "../helpers/axios";
import { printInterval } from '../helpers/interval';
import { notifyErr } from '../helpers/notification';
import { HttpStatus } from '../http/status';
	import { __ } from "../i18n";
import DeletePaymentModal from '../modals/DeletePaymentModal.svelte';
import SaveCompanyModal from '../modals/SaveCompanyModal.svelte';
import SavePaymentModal from '../modals/SavePaymentModal.svelte';

	export let params = {
		id: null,
		projectId: null,
	};

	/** @type {import('../DAL/payment').Payment | null}*/
	let details = null;
	let loading = false;
	/**@type {import('../DAL/project').Project | null}*/
	let project = null;

	let showUpdateModal = false;
	let showDeleteModal = false;

	const actions = [
		{ name: 'edit', tooltip: __("Edit"), icon: 'pencil' },
		{ name: 'delete', tooltip: __("Delete"), icon: 'trash' },
	];

	setResumable(false);

	async function loadData() {
		if (!params.id) {
			return;
		}
		loading = true;
		try {
			details = await get(params.id, params.projectId);
			project = $projects.find((p) => p.id === details.projectId);
		} catch (err) {
			statusMatch(err, {
				[HttpStatus.Forbidden]: () => (notifyErr(__("You are not authorised to view this payment")), pop({ refresh: true })),
				[HttpStatus.NotFound]: () => (notifyErr(__("Payment not found")), pop({ refresh: true })),
			});
		} finally {
			loading = false;
		}
	}

	$: params.id, loadData();
</script>

<LoaderWrapper {loading}>
	{#if details}
		<Breadcrumb
			path={[{ label: __("Home"), href: '/#' }, { href: '/#/payment/all', label: __('Payments') }, { label: `${project.name} - ${details.date.toLocaleString()}` }]} />
		<Card
			style="position: relative"
			className="uk-width-3-4@l uk-width-4-5@m uk-width-5-6 uk-margin-auto"
			title={`${project.name} - ${details.date.toLocaleString()}`}>
			<CardActions 
				{actions}
				on:edit={() => showUpdateModal = true}
				on:delete={() => showDeleteModal = true}
			/>
			<h5>{__('Date')}</h5>
			<p>{details.date.toLocaleString()}</p>
			<h5>{__('Project')}</h5>
			<p><Anchor href={`/project/details/${project.id}`}>{project.name}</Anchor></p>
			<h5>{__('Amount')}</h5>
			<p>{__(":currency :amount", { currency: details.currency, amount: details.amount.toFormat(2)})}</p>
		</Card>
	{/if}
</LoaderWrapper>

<SavePaymentModal 
	entity={details}
	bind:show={showUpdateModal}
	on:save={() => loadData()}
/>

<DeletePaymentModal 
	entity={details}
	bind:show={showDeleteModal}
	on:delete={() => pop({ refresh: true })}
/>
