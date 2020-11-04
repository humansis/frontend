<template>
	<div>
		<h2>Status Rate</h2>
		<PieChart
			:datacollection="pieData"
			:options="pieOptions"
		/>
		<h2>Requests Per Day</h2>
		<LineChart
			:datacollection="lineData"
			:options="lineOptions"
		/>
		<h2>Most Active Users</h2>
		<BarChart
			:datacollection="barData"
			:options="barOptions"
		/>
		<h2>Requests Per Country</h2>
		<LineChart
			ref="requestsPerCountry"
			:datacollection="multiLineData"
			:options="multiLineOptions"
		/>
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
