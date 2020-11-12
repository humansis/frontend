<template>
	<div class="is-flex-wrap-wrap is-flex is-flex-direction-row is-justify-content-space-around">
		<div class="is-flex-grow-0 graph-item">
			<div class="is-size-5 has-text-centered">Status Rate</div>
			<PieChart
				:dataCollection="pieData"
				:options="pieOptions"
			/>
		</div>
		<div class="is-flex-grow-0 graph-item">
			<div class="is-size-5 has-text-centered">Requests Per Day</div>
			<LineChart
				:dataCollection="lineData"
				:options="lineOptions"
			/>
		</div>
		<div class="is-flex-grow-0 graph-item">
			<div class="is-size-5 has-text-centered">Most Active Users</div>
			<BarChart
				:dataCollection="barData"
				:options="barOptions"
			/>
		</div>
		<div class="is-flex-grow-0 graph-item is-block">
			<div class="is-size-5 has-text-centered">Requests Per Country</div>
			<LineChart
				ref="requestsPerCountry"
				:dataCollection="multiLineData"
				:options="multiLineOptions"
			/>
		</div>

	</div>
</template>

<script>
import PieChart from "@/components/Logs/Charts/PieChart";
import LineChart from "@/components/Logs/Charts/LineChart";
import BarChart from "@/components/Logs/Charts/BarChart";

export default {
	name: "ReportsLog",

	components: {
		BarChart,
		LineChart,
		PieChart,
	},

	data() {
		return {
			pieData: {
				labels: ["Item1", "Item2", "Item3"],
				datasets: [
					{
						label: "Data One",
						backgroundColor: "#f87979",
						pointBackgroundColor: "white",
						borderWidth: 1,
						pointBorderColor: "#249EBF",
						data: [60, 40, 20],
					},
				],
			},
			pieOptions: {
				legend: {
					display: true,
				},
				responsive: true,
				maintainAspectRatio: false,
			},
			lineData: {
				labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
				datasets: [
					{
						label: "Data One",
						backgroundColor: "#f87979",
						pointBackgroundColor: "white",
						borderWidth: 1,
						pointBorderColor: "#249EBF",
						data: [60, 40, 20, 50, 90, 10, 20, 40, 50, 70, 90, 120],
					},
				],
			},
			lineOptions: {
				scales: {
					yAxes: [{
						ticks: {
							beginAtZero: true,
						},
						gridLines: {
							display: true,
						},
					}],
					xAxes: [{
						gridLines: {
							display: false,
						},
					}],
				},
				legend: {
					display: true,
				},
				responsive: true,
				maintainAspectRatio: false,
			},
			barData: {
				labels: ["User1", "User2", "User3"],
				datasets: [
					{
						label: "Data One",
						backgroundColor: "#f87979",
						pointBackgroundColor: "white",
						borderWidth: 1,
						pointBorderColor: "#249EBF",
						data: [60, 40, 30],
					},
				],
			},
			barOptions: {
				scales: {
					yAxes: [{
						ticks: {
							beginAtZero: true,
						},
						gridLines: {
							display: true,
						},
					}],
					xAxes: [{
						gridLines: {
							display: false,
						},
					}],
				},
				legend: {
					display: true,
				},
				responsive: true,
				maintainAspectRatio: false,
			},
			multiLineData: {
				labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
				datasets: [
					{
						label: "Data One",
						backgroundColor: "#f87979",
						pointBackgroundColor: "white",
						borderWidth: 1,
						pointBorderColor: "#249EBF",
						data: [60, 40, 20, 50, 90, 10, 20, 40, 50, 70, 90, 120],
					},
					{
						label: "Data Two",
						backgroundColor: "#249EBF",
						pointBackgroundColor: "white",
						borderWidth: 1,
						pointBorderColor: "#249EBF",
						data: [50, 60, 10, 20, 60, 40, 60, 40, 50, 70, 90, 120],
					},
				],
			},
			multiLineOptions: {
				scales: {
					yAxes: [{
						ticks: {
							beginAtZero: true,
						},
						gridLines: {
							display: true,
						},
					}],
					xAxes: [{
						gridLines: {
							display: false,
						},
					}],
				},
				legend: {
					display: true,
				},
				responsive: true,
				maintainAspectRatio: false,
			},
		};
	},
};

</script>

<style scoped>
.graph-item {
	width: 300px;
	height: 500px;
}
</style>
