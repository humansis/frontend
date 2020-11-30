<template>
	<div ref="assistanceSummary">
		<h2 class="title has-text-centered">
			Assistance name
		</h2>
		<h3 class="subtitle has-text-centered">
			Last Modified : 12-05-1909 07:55
		</h3>
		<nav class="level is-mobile">
			<div class="level-item has-text-centered">
				<div class="box">
					<p class="heading">Province</p>
					<p class="title">Province 1</p>
				</div>
			</div>
			<div class="level-item has-text-centered">
				<div class="box">
					<p class="heading">Beneficiaries</p>
					<p class="title">1000</p>
				</div>
			</div>
			<div class="level-item has-text-centered">
				<div class="box">
					<p class="heading">Date Of Distribution</p>
					<p class="title">20-09-2021</p>
				</div>
			</div>
			<div class="level-item has-text-centered">
				<div class="box">
					<p class="heading">Project</p>
					<p class="title">Project 1</p>
				</div>
			</div>
			<div class="level-item has-text-centered">
				<div class="box">
					<p class="heading">Target</p>
					<p class="title">1000</p>
				</div>
			</div>
			<div class="level-item has-text-centered">
				<div class="box">
					<p class="heading">Commodity</p>
					<p class="title">MONEY</p>
				</div>
			</div>
		</nav>
		<hr>
	</div>
</template>

<script>
export default {
	name: "ProjectSummary",

	data() {
		return {
			assistanceSummary: null,
		};
	},

	watch: {
		$route: "fetchData",
	},

	mounted() {
		this.fetchData();
	},

	methods: {
		async fetchData() {
			const loadingComponent = this.$buefy.loading.open({
				container: this.$refs.assistanceSummary,
			});

			// TODO Add service: Get single assistance

			loadingComponent.close();
		},
	},
};
</script>
