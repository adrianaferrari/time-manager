<script>
	import Chart from "chart.js/auto";
	import { onDestroy, onMount } from "svelte";
	import { getColor, theme } from "../ui-ux/theme";

	export let type = "line";
	export let labels = [];
	export let datasets = [];
	export let options = undefined;
	export let small = false;

	/** @type HTMLCanvasElement */
	let canvas = undefined;
	let chart;

	function loadChart() {
		if (chart) {
			chart.destroy();
		}
		const ctx = canvas.getContext("2d");
		chart = new Chart(ctx, {
			type,
			data: {
				labels,
				datasets,
			},
			options,
		});
	}

	function updateChartDatasets() {
		chart.data.datasets = datasets;
		chart.update();
	}

	function updateChartLabels() {
		chart.data.labels = labels;
		chart.update();
	}

	function updateGrid() {
		const emphasis = getColor("--global-emphasis-color", 0.5);
		Chart.defaults.color = emphasis;
		chart.update();
	}

	onMount(() => {
		document.fonts?.ready?.then(() => {
			updateGrid();
		});
	});

	onDestroy(() => {
		if (chart) {
			chart.destroy();
			chart = null;
		}
	});

	$: if (canvas) {
		loadChart();
	}

	$: if (chart && datasets !== chart.datasets) {
		updateChartDatasets();
	}

	$: if (chart && labels !== chart.labels) {
		updateChartLabels();
	}

	$: if (chart && $theme) {
		updateGrid();
	}
</script>

<style lang="scss">
	.chart-container {
		min-height: 300px;
		position: relative;
		&.small-chart {
			min-height: 200px;
		}
	}
</style>

<div class="chart-container" class:small-chart={small}>
	<canvas bind:this={canvas} />
</div>
