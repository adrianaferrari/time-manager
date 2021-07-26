<script>
	import { Breadcrumb, Card, LoaderWrapper } from "custom-uikit-svelte";
	import { onMount } from "svelte";
	import { onAfterLoad } from "svelte-stack-router";
	import { derived, writable } from "svelte/store";
	import Chart from "../components/Chart.svelte";
	import IconButton from "../components/IconButton.svelte";
	import { clients } from "../DAL/client";
	import { companies } from "../DAL/company";
	import { projects } from "../DAL/project";

	import {
		getEffortByMonth,
		getPaymentByClient,
		getPaymentByMonth,
		getRateByClient,
		getRateByCompany,
		getRateByProject,
	} from "../DAL/stats";
	import { statusMatch } from "../helpers/axios";
	import { __ } from "../i18n";
import { getColorRange } from '../ui-ux/theme';

	const paymentByMonth = writable(null);
	const paymentByClient = writable(null);
	const effortByMonth = writable(null);
	const rateByProject = writable(null);
	const rateByCompany = writable(null);
	const rateByClient = writable(null);

	const months = [
		__("January"),
		__("February"),
		__("March"),
		__("April"),
		__("May"),
		__("June"),
		__("July"),
		__("August"),
		__("September"),
		__("October"),
		__("November"),
		__("December"),
	];
	const shortMonths = months.map((m) => m.substr(0, 3));
	const startMonth = new Date().getMonth();

	const yearByMonthLabels = [
		...shortMonths.slice(startMonth),
		...shortMonths.slice(0, startMonth),
	];

	const paymentByMonthDatasets = derived(paymentByMonth, ($paymentByMonth) => {
		if (!$paymentByMonth) {
			return [];
		}
		const colors = getColorRange('--global-primary-background', '--global-secondary-background', $paymentByMonth.currencies.length);
		const colorsBg = getColorRange('--global-primary-background', '--global-secondary-background', $paymentByMonth.currencies.length, 0.5);
		const tmpData = $paymentByMonth.currencies.map((c, i) => ({
			label: c,
			data: new Array(12),
			borderColor: colors[i],
			backgroundColor: colorsBg[i],
		}));
		$paymentByMonth.data.forEach((pbm) => {
			const monthPosition = (pbm.month - startMonth - 1 + 12) % 12;
			$paymentByMonth.currencies.forEach((c, cIndex) => {
				tmpData[cIndex].data[monthPosition] = pbm[c].toFixed(2);
			});
		});
		return tmpData;
	});

	let paymentByClientLabels = [];
	const paymentByClientDatasets = derived(
		[paymentByClient, clients],
		([$paymentByClient, $clients]) => {
			if (!$paymentByClient || !$clients) {
				return [];
			}
			paymentByClientLabels = $paymentByClient.clientIds.map((cId) => {
				const client = $clients.find((c) => c.id === cId);
				if (!client) return __("unknown");
				return client.firstName + " " + client.lastName;
			});
			const colors = getColorRange('--global-primary-background', '--global-secondary-background', $paymentByClient.clientIds.length);
			const tmpData = $paymentByClient.currencies.map((c) => ({
				label: c,
				data: new Array($paymentByClient.clientIds.length),
				backgroundColor: colors,
			}));
			$paymentByClient.data.forEach((pbc) => {
				const clientIndex = $paymentByClient.clientIds.findIndex(
					(cId) => cId === pbc.clientId
				);
				$paymentByClient.currencies.forEach((c, cIndex) => {
					tmpData[cIndex].data[clientIndex] = pbc[c].toFixed(2);
				});
			});
			return tmpData;
		}
	);

	const effortByMonthDatasets = derived(effortByMonth, ($effortByMonth) => {
		if (!$effortByMonth) {
			return [];
		}
		const colors = getColorRange('--global-primary-background', '--global-secondary-background', 1);
		const colorsBg = getColorRange('--global-primary-background', '--global-secondary-background', 1, 0.5);
		const tmpData = [
			{
				label: __("Hours"),
				data: new Array(12),
				backgroundColor: colorsBg[0],
				borderColor: colors[0],
			},
		];
		$effortByMonth.forEach((ebm) => {
			const monthPosition = (ebm.month - startMonth - 1 + 12) % 12;
			tmpData[0].data[monthPosition] = (
				ebm.effort.d * 24 +
				ebm.effort.h +
				ebm.effort.m / 60
			).toFixed(2);
		});
		return tmpData;
	});

	let rateByProjectLabels = [];
	const rateByProjectDatasets = derived(
		[rateByProject, projects],
		([$rateByProject, $projects]) => {
			if (!$rateByProject || !$projects) {
				return [];
			}
			rateByProjectLabels = $rateByProject.projectIds.map(
				(pId) => $projects.find((p) => p.id === pId)?.name || __("unknown")
			);
			const colors = getColorRange('--global-primary-background', '--global-secondary-background', $rateByProject.currencies.length * 2);
			const colorsBg = getColorRange('--global-primary-background', '--global-secondary-background', $rateByProject.currencies.length * 2, 0.5);
			const tmpData = $rateByProject.currencies.flatMap((c, i) => [
				{
					label: c,
					data: new Array($rateByProject.projectIds.length),
					borderColor: colors[i * 2],
					backgroundColor: colors[i * 2],
				},
				{
					label: __(":currency - avg", { currency: c }),
					data: new Array($rateByProject.projectIds.length),
					type: "line",
					borderColor: colors[i * 2 + 1],
					backgroundColor: colorsBg[i * 2 + 1],
				},
			]);
			$rateByProject.data.forEach((rbp) => {
				const projectIndex = $rateByProject.projectIds.findIndex(
					(pId) => pId === rbp.projectId
				);
				$rateByProject.currencies.forEach((c, cIndex) => {
					tmpData[cIndex * 2].data[projectIndex] = rbp[c].toFixed(2);
					tmpData[cIndex * 2 + 1].data[projectIndex] = $rateByProject.dataAvg[
						c
					].toFixed(2);
				});
			});
			return tmpData;
		}
	);

	let rateByCompanyLabels = [];
	const rateByCompanyDatasets = derived(
		[rateByCompany, companies],
		([$rateByCompany, $companies]) => {
			if (!$rateByCompany || !$companies) {
				return [];
			}
			rateByCompanyLabels = $rateByCompany.companyIds.map(
				(cId) => $companies.find((c) => c.id === cId)?.name || __("unknown")
			);
			const colors = getColorRange('--global-primary-background', '--global-secondary-background', $rateByProject.currencies.length * 2);
			const colorsBg = getColorRange('--global-primary-background', '--global-secondary-background', $rateByProject.currencies.length * 2, 0.5);
			const tmpData = $rateByCompany.currencies.flatMap((c, i) => [
				{
					label: c,
					data: new Array($rateByCompany.companyIds.length),
					backgroundColor: colors[i * 2],
					borderColor: colors[i * 2]
				},
				{
					label: __(":currency - avg", { currency: c }),
					data: new Array($rateByCompany.companyIds.length),
					type: "line",
					backgroundColor: colorsBg[i * 2 + 1],
					borderColor: colors[i * 2 + 1],
				},
			]);
			$rateByCompany.data.forEach((rbc) => {
				const companyIndex = $rateByCompany.companyIds.findIndex(
					(cId) => cId === rbc.companyId
				);
				$rateByCompany.currencies.forEach((c, cIndex) => {
					tmpData[cIndex * 2].data[companyIndex] = rbc[c].toFixed(2);
					tmpData[cIndex * 2 + 1].data[companyIndex] = $rateByCompany.dataAvg[
						c
					].toFixed(2);
				});
			});
			return tmpData;
		}
	);

	let rateByClientLabels = [];
	const rateByClientDatasets = derived(
		[rateByClient, clients],
		([$rateByClient, $clients]) => {
			if (!$rateByClient || !$clients) {
				return [];
			}
			rateByClientLabels = $rateByClient.clientIds.map((cId) => {
				const client = $clients.find((c) => c.id === cId);
				if (!client) return __("unknown");
				return client.firstName + " " + client.lastName;
			});
			const colors = getColorRange('--global-primary-background', '--global-secondary-background', $rateByProject.currencies.length * 2);
			const colorsBg = getColorRange('--global-primary-background', '--global-secondary-background', $rateByProject.currencies.length * 2, 0.5);
			const tmpData = $rateByClient.currencies.flatMap((c, i) => [
				{
					label: c,
					data: new Array($rateByClient.clientIds.length),
					backgroundColor: colors[i * 2],
					borderColor: colors[i * 2],
				},
				{
					label: __(":currency - avg", { currency: c }),
					data: new Array($rateByClient.clientIds.length),
					type: "line",
					backgroundColor: colorsBg[i * 2 + 1],
					borderColor: colors[i * 2 + 1],
				},
			]);
			$rateByClient.data.forEach((rbc) => {
				const clientIndex = $rateByClient.clientIds.findIndex(
					(cId) => cId === rbc.clientId
				);
				$rateByClient.currencies.forEach((c, cIndex) => {
					tmpData[cIndex * 2].data[clientIndex] = rbc[c].toFixed(2);
					tmpData[cIndex * 2 + 1].data[clientIndex] = $rateByClient.dataAvg[
						c
					].toFixed(2);
				});
			});
			return tmpData;
		}
	);

	const chartOptions = {
		paymentByMonth: {
			plugins: {
				title: {
					display: true,
					text: __("Payment by month"),
				},
				subtitle: {
					display: true,
					text: __("How much money you received during the last 12 months"),
				},
			},
		},
		effortByMonth: {
			plugins: {
				title: {
					display: true,
					text: __("Effort by month"),
				},
				subtitle: {
					display: true,
					text: __("How many hours you worked during the last 12 months"),
				},
			},
		},
		rateByClient: {
			plugins: {
				title: {
					display: true,
					text: __("Rate by client"),
				},
				subtitle: {
					display: true,
					text: __(
						"Your hourly rate - your average and the one you have for each client"
					),
				},
			},
		},
		rateByCompany: {
			plugins: {
				title: {
					display: true,
					text: __("Rate by company"),
				},
				subtitle: {
					display: true,
					text: __(
						"Your hourly rate - your average and the one you have for each company"
					),
				},
			},
		},
		rateByProject: {
			plugins: {
				title: {
					display: true,
					text: __("Rate by project"),
				},
				subtitle: {
					display: true,
					text: __(
						"Your hourly rate for the project you worked on in the last 12 months"
					),
				},
			},
		},
		paymentByClient: {
			plugins: {
				title: {
					display: true,
					text: __("Payment by client"),
				},
				subtitle: {
					display: true,
					text: __("How much money you ever received by each client"),
				},
				tooltip: {
					callbacks: {
						label: (context) =>
							`${context.label}: ${context.formattedValue} ${
								context.dataset.label ?? ""
							}`,
					},
				},
			},
		},
	};

	const chartStores = {
		paymentByMonth,
		paymentByClient,
		effortByMonth,
		rateByProject,
		rateByCompany,
		rateByClient,
	};

	const chartReloadFns = {
		paymentByMonth: getPaymentByMonth,
		paymentByClient: getPaymentByClient,
		effortByMonth: getEffortByMonth,
		rateByProject: getRateByProject,
		rateByCompany: getRateByCompany,
		rateByClient: getRateByClient,
	};

	const chartLoading = {
		paymentByMonth: false,
		paymentByClient: false,
		effortByMonth: false,
		rateByProject: false,
		rateByCompany: false,
		rateByClient: false,
	};

	async function loadData(toLoad) {
		try {
			if (!toLoad) {
				for (const key of Object.keys(chartStores)) {
					chartLoading[key] = true;
					try {
						chartStores[key].set(await chartReloadFns[key]());
					} finally {
						chartLoading[key] = false;
					}
				}
			} else {
				try {
					chartLoading[toLoad] = true;
					chartStores[toLoad].set(await chartReloadFns[toLoad]());
				} finally {
					chartLoading[toLoad] = false;
				}
			}
		} catch (err) {
			statusMatch(err);
		}
	}

	onMount(() => loadData());
</script>

<Breadcrumb path={[{ label: __('Stats') }]} />
<div class="uk-container">
	<div uk-grid class="uk-grid-small">
		<div class="uk-width-1-2@m">
			<Card style="position: relative;">
				<IconButton
					icon="refresh"
					style="position: absolute; right: 15px; top: 15px;"
					on:click={() => !chartLoading.paymentByMonth && loadData('paymentByMonth')} />
				<LoaderWrapper
					loading={!$paymentByMonthDatasets.length}
					style="min-height: 300px;">
					<Chart
						labels={yearByMonthLabels}
						type="line"
						options={chartOptions.paymentByMonth}
						datasets={$paymentByMonthDatasets} />
				</LoaderWrapper>
			</Card>
		</div>
		<div class="uk-width-1-2@m">
			<Card style="position: relative;">
				<IconButton
					icon="refresh"
					style="position: absolute; right: 15px; top: 15px;"
					on:click={() => !chartLoading.paymentByClient && loadData('paymentByClient')} />
				<LoaderWrapper
					loading={!$paymentByClientDatasets.length}
					style="min-height: 300px;">
					<Chart
						labels={paymentByClientLabels}
						type="pie"
						options={chartOptions.paymentByClient}
						datasets={$paymentByClientDatasets} />
				</LoaderWrapper>
			</Card>
		</div>
		<div class="uk-width-1-2@m">
			<Card style="position: relative;">
				<IconButton
					icon="refresh"
					style="position: absolute; right: 15px; top: 15px;"
					on:click={() => !chartLoading.effortByMonth && loadData('effortByMonth')} />
				<LoaderWrapper
					loading={!$effortByMonthDatasets.length}
					style="min-height: 300px;">
					<Chart
						labels={yearByMonthLabels}
						type="line"
						options={chartOptions.effortByMonth}
						datasets={$effortByMonthDatasets} />
				</LoaderWrapper>
			</Card>
		</div>
		<div class="uk-width-1-2@m">
			<Card style="position: relative;">
				<IconButton
					icon="refresh"
					style="position: absolute; right: 15px; top: 15px;"
					on:click={() => !chartLoading.rateByProject && loadData('rateByProject')} />
				<LoaderWrapper
					loading={!$rateByProjectDatasets.length}
					style="min-height: 300px;">
					<Chart
						labels={rateByProjectLabels}
						type="bar"
						options={chartOptions.rateByProject}
						datasets={$rateByProjectDatasets} />
				</LoaderWrapper>
			</Card>
		</div>
		<div class="uk-width-1-2@m">
			<Card style="position: relative;">
				<IconButton
					icon="refresh"
					style="position: absolute; right: 15px; top: 15px;"
					on:click={() => !chartLoading.rateByCompany && loadData('rateByCompany')} />
				<LoaderWrapper
					loading={!$rateByCompanyDatasets.length}
					style="min-height: 300px;">
					<Chart
						labels={rateByCompanyLabels}
						type="bar"
						options={chartOptions.rateByCompany}
						datasets={$rateByCompanyDatasets} />
				</LoaderWrapper>
			</Card>
		</div>
		<div class="uk-width-1-2@m">
			<Card style="position: relative;">
				<IconButton
					icon="refresh"
					style="position: absolute; right: 15px; top: 15px;"
					on:click={() => !chartLoading.rateByClient && loadData('rateByClient')} />
				<LoaderWrapper
					loading={!$rateByClientDatasets.length}
					style="min-height: 300px;">
					<Chart
						labels={rateByClientLabels}
						type="bar"
						options={chartOptions.rateByClient}
						datasets={$rateByClientDatasets} />
				</LoaderWrapper>
			</Card>
		</div>
	</div>
</div>
