<script>
	import { Interval } from "@cdellacqua/interval";
	import BigNumber from "bignumber.js";
	import {
		Breadcrumb,
		Button,
		Card,
		DataTable,
		LoaderWrapper,
	} from "custom-uikit-svelte";
	import { onMount } from "svelte";

	import { dive, pop, push, setResumable } from "svelte-stack-router";
	import Anchor from "../components/Anchor.svelte";
	import CardActions from "../components/CardActions.svelte";
	import IconButton from "../components/IconButton.svelte";
	import { categories } from "../DAL/category";
	import { clients } from "../DAL/client";
	import { get } from "../DAL/project";
	import { technologies } from "../DAL/technology";
	import { dayLength } from "../DAL/user";
	import { statusMatch } from "../helpers/axios";
	import { Currency } from "../helpers/currency";
	import { printInterval } from "../helpers/interval";
import { notifyErr } from '../helpers/notification';
import { HttpStatus } from '../http/status';
	import { __ } from "../i18n";
import DeleteProjectModal from '../modals/DeleteProjectModal.svelte';
import DownloadActivityReportModal from '../modals/DownloadActivityReportModal.svelte';
import SaveActivityModal from '../modals/SaveActivityModal.svelte';
	import SavePaymentModal from "../modals/SavePaymentModal.svelte";
	import SaveProjectModal from "../modals/SaveProjectModal.svelte";
	import Payment from "./Payment.svelte";

	export let params = {
		id: null,
	};

	/** @type {import('../DAL/project').ProjectDetails | null}*/
	let details = null;
	let loading = false;
	/** @type {import('../DAL/client').Client | null}*/
	let client = null;
	/** @type {Interval | null}*/
	let timeSpent = null;
	/** @type {import('../DAL/technology').Technology[]}*/
	let technologyList = [];
	/** @type {{ amount: BigNumber, currency: Currency }[]}*/
	let totalPaymentByCurrency = [];

	let showUpdateModal = false;
	let showDeleteModal = false;
	let showAddPaymentModal = false;
	let showAddActivityModal = false;
	let showDownloadActivityReportModal = false;

	/** @type {Partial<import('../DAL/payment').SavePayment> | null}*/
	let newPaymentDetails = null;

	/** @type {Partial<import('../DAL/activity').SaveActivity> | null}*/
	let newActivityDetails = null;

	const actions = [
		{ name: "edit", tooltip: __("Edit"), icon: "pencil" },
		{ name: "delete", tooltip: __("Delete"), icon: "trash" },
		{ name: "download", tooltip: __("Download"), icon: "download" },
	];

	const activityColumns = [
		{
			label: __("Date"),
			key: "date",
			render: (/** @type {DateOnly}*/ date) => date.toLocaleString(),
		},
		{
			label: __("Time spent"),
			key: "timeSpent",
			render: (/** @type {Interval}*/ timeSpent) => timeSpent.toString(),
		},
		{
			label: __("Description"),
			key: "description",
		},
		{
			label: __("Category"),
			key: "category.name",
			render: (_, { categoryId }) =>
				$categories.find((category) => category.id === categoryId)?.name,
		},
	];

	setResumable(false);

	async function loadData() {
		if (!params.id) {
			return;
		}
		newPaymentDetails = { projectId: params.id };
		newActivityDetails = { projectId: params.id };
		loading = true;
		try {
			details = await get(params.id);
			client = $clients.find((c) => c.id === details.clientId);
			timeSpent = details.timeSpent;
			technologyList = details.technologyIds.map((tId) =>
				$technologies.find((t) => t.id === tId)
			);
			let totalPaymentByCurrencyTmp = [];
			details.payments.forEach((p) => {
				const paymentByCurrency = totalPaymentByCurrencyTmp.find(
					(pbc) => pbc.currency === p.currency
				);
				if (paymentByCurrency) {
					paymentByCurrency.amount = paymentByCurrency.amount.plus(p.amount);
				} else {
					totalPaymentByCurrencyTmp.push({
						currency: p.currency,
						amount: new BigNumber(p.amount),
					});
				}
			});
			totalPaymentByCurrency = totalPaymentByCurrencyTmp;
		} catch (err) {
			statusMatch(err, {
				[HttpStatus.Forbidden]: () => (notifyErr(__("You're not authorised to view this project")), pop()),
				[HttpStatus.NotFound]: () => (notifyErr(__("Project not found")), pop())
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
			path={[{ label: __("Home"), href: '/#' }, { href: '/#/project/all', label: __('Projects') }, { label: details.name }]} />
		<Card
			style="position: relative"
			className="uk-width-3-4@l uk-width-4-5@m uk-width-5-6 uk-margin-auto"
			title={details.name}>
			<CardActions
				{actions}
				on:edit={() => (showUpdateModal = true)}
				on:delete={() => (showDeleteModal = true)}
				on:download={() => (showDownloadActivityReportModal = true)} />
			<h5>{__('Duration')}</h5>
			<p>
				{`${details.startDate.toLocaleString()} - ${details.endDate?.toLocaleString() ?? __('work in progress')}`}
			</p>
			<h5>{__('Client')}</h5>
			<p>
				{#if client}
					<Anchor href={`/client/details/${client.id}`}>
						{`${client.firstName} ${client.lastName}`}
					</Anchor>
				{:else}{__('N/A')}{/if}
			</p>
			<h5>{__('Technologies')}</h5>
			<p>
				{#each technologyList as technology}
					<Anchor
						href={`/technology/details/${technology.id}`}
						className="uk-margin-small-right">
						{technology.name}
					</Anchor>
				{:else}
					<span class="uk-text-italic">{__('No technologies found')}</span>
				{/each}
			</p>
			{#if details.estimatedEffort}
				<h5>{__('Estimated and actual effort')}</h5>
				<div uk-grid class="uk-grid-small">
					<div class="uk-width-1-3">
						{`Estimated: ${printInterval(details.estimatedEffort, $dayLength)}`}
					</div>
					<div class="uk-width-1-3">
						{`Actual: ${printInterval(timeSpent, $dayLength)}`}
					</div>
					<div class="uk-width-1-3">
						{`Progress: ${new BigNumber(timeSpent.totalSeconds)
							.div(details.estimatedEffort.totalSeconds)
							.times(100)
							.toFormat(2)}%`}
					</div>
				</div>
			{:else}
				<h5>{__('Actual effort')}</h5>
				<p>{printInterval(timeSpent, $dayLength)}</p>
			{/if}
			<h5>{__('Effort by category')}</h5>
			<ul class="uk-list">
				{#each details.timeSpentByCategory as tsbc}
					<li>
						{#if $categories.find((c) => c.id === tsbc.categoryId)}
							<Anchor href={`/category/details/${$categories.find((c) => c.id === tsbc.categoryId).id}`}>{$categories.find((c) => c.id === tsbc.categoryId).name}</Anchor>:
							{printInterval(tsbc.timeSpent, $dayLength)}
						{/if}
					</li>
				{/each}
			</ul>
			<h5>
				{__('Payments (:len)', { len: details.payments.length })}
				<IconButton
					className="uk-margin-small-left"
					on:click={() => (showAddPaymentModal = true)}
					icon="plus" />
			</h5>

			<ul class="uk-list">
				{#each details.payments as payment}
					<li>
						<Anchor href={`/payment/details/${payment.id}`}>
							{`${payment.date.toLocaleString()} - ${payment.currency} ${payment.amount.toFormat(2)}`}
						</Anchor>
					</li>
				{:else}
					<span class="uk-text-italic">{__('No payments found')}</span>
				{/each}
			</ul>
			{#if totalPaymentByCurrency.length > 0}
				<p>
					{__('Received: :totalPayment', {
						totalPayment: totalPaymentByCurrency
							.map(({ amount, currency }) => `${currency} ${amount.toFormat(2)}`)
							.join(', '),
					})}
				</p>
			{/if}
			{#if details.price}
				<p>
					{__('Expected: :currency :price', {
						price: details.price.toFormat(2),
						currency: details.currency,
					})}
				</p>
			{/if}
			<h5>{__('Hourly rates')}</h5>
			<div uk-grid class="uk-grid-small">
				<div class="uk-width-1-3" />
				<div class="uk-width-1-3">{__('Estimated effort')}</div>
				<div class="uk-width-1-3">{__('Actual effort')}</div>
				<div class="uk-width-1-3">{__('Estimated price')}</div>
				<div class="uk-width-1-3">
					{details.estimatedEffort?.totalSeconds > 0 && details.price ? `${details.currency} ${details.price
								.div(details.estimatedEffort.totalSeconds)
								.times(3600)
								.toFormat(2)}` : __('n/d')}
				</div>
				<div class="uk-width-1-3">
					{timeSpent.totalSeconds > 0 && details.price ? `${details.currency} ${details.price
								.div(timeSpent.totalSeconds)
								.times(3600)
								.toFormat(2)}` : __('n/d')}
				</div>
				<div class="uk-width-1-3">{__('Actual payments')}</div>
				<div class="uk-width-1-3">
					{details.estimatedEffort?.totalSeconds > 0 && totalPaymentByCurrency.length ? totalPaymentByCurrency
								.map(
									({ amount, currency }) =>
										`${currency} ${amount
											.div(details.estimatedEffort.totalSeconds)
											.times(3600)
											.toFormat(2)}`
								)
								.join(', ') : __('n/d')}
				</div>
				<div class="uk-width-1-3">
					{timeSpent.totalSeconds > 0 && totalPaymentByCurrency.length ? totalPaymentByCurrency
								.map(
									({ amount, currency }) =>
										`${currency} ${amount
											.div(timeSpent.totalSeconds)
											.times(3600)
											.toFormat(2)}`
								)
								.join(', ') : __('n/d')}
				</div>
			</div>
			<h5>
				{__('Activities (:len)', { len: details.activities.length })}
				<IconButton
					className="uk-margin-small-left"
					on:click={() => (showAddActivityModal = true)}
					icon="plus" />
			</h5>
			<DataTable
				columns={activityColumns}
				rows={details.activities}
				recordsPerPage={10}
				noResultText={__('No activities found')}
				on:row-click={({ detail }) => push(`/activity/details/${detail.id}`)} />
		</Card>
	{:else}
		<p class="uk-text-italic uk-text-center">{__("An error occurred while fetching this project's data.")}</p>
		<div class="uk-text-center"><Button icon="refresh">{__("Reload")}</Button></div>
	{/if}
</LoaderWrapper>

<SaveProjectModal
	entity={details}
	bind:show={showUpdateModal}
	on:save={() => loadData()} />

<SavePaymentModal
	entity={newPaymentDetails}
	bind:show={showAddPaymentModal}
	on:save={() => loadData()} />

<SaveActivityModal
	entity={newActivityDetails}
	bind:show={showAddActivityModal}
	on:save={() => loadData()}
/>

<DeleteProjectModal 
	on:delete={() => pop()}
	entity={details}
	bind:show={showDeleteModal}
/>

<DownloadActivityReportModal
	projectId={details?.id}
	bind:show={showDownloadActivityReportModal}
/>
