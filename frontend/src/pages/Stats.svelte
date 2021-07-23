<script>
	import { LoaderWrapper } from "custom-uikit-svelte";
import { onMount } from 'svelte';
	import { onAfterLoad } from "svelte-stack-router";
	import { derived, writable } from "svelte/store";
	import Chart from "../components/Chart.svelte";
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
		const tmpData = $paymentByMonth.currencies.map((c) => ({
			label: c,
			data: new Array(12),
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
			const tmpData = $paymentByClient.currencies.map((c) => ({
				label: c,
				data: new Array($paymentByClient.clientIds.length),
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
		const tmpData = [
			{
				label: __("Hours"),
				data: new Array(12),
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
			const tmpData = $rateByProject.currencies.flatMap((c) => [
				{
					label: c,
					data: new Array($rateByProject.projectIds.length),
				},
				{
					label: __(":currency - avg", { currency: c }),
					data: new Array($rateByProject.projectIds.length),
					type: "line",
					fill: false,
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
			const tmpData = $rateByCompany.currencies.flatMap((c) => [
				{
					label: c,
					data: new Array($rateByCompany.companyIds.length),
				},
				{
					label: __(":currency - avg", { currency: c }),
					data: new Array($rateByCompany.companyIds.length),
					type: "line",
					fill: false,
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
			const tmpData = $rateByClient.currencies.flatMap((c) => [
				{
					label: c,
					data: new Array($rateByClient.clientIds.length),
				},
				{
					label: __(":currency - avg", { currency: c }),
					data: new Array($rateByClient.clientIds.length),
					type: "line",
					fill: false,
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
					text: __("How much money you received during the last 12 months")
				}
			}
		},
		effortByMonth: {
			plugins: {
				title: {
					display: true,
					text: __("Effort by month"),
				},
				subtitle: {
					display: true,
					text: __("How many hours you worked during the last 12 months")
				}
			}
		},
		rateByClient: {
			plugins: {
				title: {
					display: true,
					text: __("Rate by client"),
				},
				subtitle: {
					display: true,
					text: __("Your hourly rate - your average and the one you have for each client")
				}
			}
		},
		rateByCompany: {
			plugins: {
				title: {
					display: true,
					text: __("Rate by company"),
				},
				subtitle: {
					display: true,
					text: __("Your hourly rate - your average and the one you have for each company")
				}
			}
		},
		rateByProject: {
			plugins: {
				title: {
					display: true,
					text: __("Rate by project"),
				},
				subtitle: {
					display: true,
					text: __("Your hourly rate for the project you worked on in the last 12 months")
				}
			}
		},
		paymentByClient: {
			plugins: {
				title: {
					display: true,
					text: __("Payment by client")
				},
				subtitle: {
					display: true,
					text: __("How much money you ever received by each client")
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
		}
	};

	async function loadData() {
		try {
			paymentByMonth.set(await getPaymentByMonth());
			paymentByClient.set(await getPaymentByClient());
			effortByMonth.set(await getEffortByMonth());
			rateByProject.set(await getRateByProject());
			rateByCompany.set(await getRateByCompany());
			rateByClient.set(await getRateByClient());
		} catch (err) {
			statusMatch(err);
		}
	}

	onAfterLoad(() => loadData());
</script>

<div uk-grid class="uk-grid-small">
	<div class="uk-width-1-2@s" style="min-height: 300px;">
		<LoaderWrapper loading={!$paymentByMonthDatasets.length}>
			<Chart
				labels={yearByMonthLabels}
				type="line"
				options={chartOptions.paymentByMonth}
				datasets={$paymentByMonthDatasets} />
		</LoaderWrapper>
	</div>
	<div class="uk-width-1-2@s" style="min-height: 300px;">
		<LoaderWrapper loading={!$paymentByClientDatasets.length}>
			<Chart
				labels={paymentByClientLabels}
				type="pie"
				options={chartOptions.paymentByClient}
				datasets={$paymentByClientDatasets} />
		</LoaderWrapper>
	</div>
	<div class="uk-width-1-2@s">
		<LoaderWrapper
			loading={!$effortByMonthDatasets.length}
			style="min-height: 300px;">
			<Chart
				labels={yearByMonthLabels}
				type="line"
				options={chartOptions.effortByMonth}
				datasets={$effortByMonthDatasets} />
		</LoaderWrapper>
	</div>
	<div class="uk-width-1-2@s">
		<LoaderWrapper
			loading={!$rateByProjectDatasets.length}
			style="min-height: 300px;">
			<Chart
				labels={rateByProjectLabels}
				type="bar"
				options={chartOptions.rateByProject}
				datasets={$rateByProjectDatasets} />
		</LoaderWrapper>
	</div>
	<div class="uk-width-1-2@s">
		<LoaderWrapper
			loading={!$rateByCompanyDatasets.length}
			style="min-height: 300px;">
			<Chart
				labels={rateByCompanyLabels}
				type="bar"
				options={chartOptions.rateByCompany}
				datasets={$rateByCompanyDatasets} />
		</LoaderWrapper>
	</div>
	<div class="uk-width-1-2@s">
		<LoaderWrapper
			loading={!$rateByClientDatasets.length}
			style="min-height: 300px;">
			<Chart
				labels={rateByClientLabels}
				type="bar"
				options={chartOptions.rateByClient}
				datasets={$rateByClientDatasets} />
		</LoaderWrapper>
	</div>
</div>
