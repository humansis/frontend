<template>
	<div v-if="projectSummary" ref="projectSummary">
		<h2 class="title has-text-centered">
			{{ projectSummary.name }}
		</h2>
		<nav class="level is-mobile">
			<div class="level-item has-text-centered">
				<div class="box">
					<p class="heading">Sectors</p>
					<p class="title">{{ projectSummary.sectorIds.length }}</p>
				</div>
			</div>
			<div class="level-item has-text-centered">
				<div class="box">
					<p class="heading">Start Date</p>
					<p class="title">{{ projectSummary.startDate }}</p>
				</div>
			</div>
			<div class="level-item has-text-centered">
				<div class="box">
					<p class="heading">End Date</p>
					<p class="title">{{ projectSummary.endDate }}</p>
				</div>
			</div>
			<div class="level-item has-text-centered">
				<div class="box">
					<p class="heading">Number of households</p>
					<p class="title">{{ projectSummary.numberOfHouseholds }}</p>
				</div>
			</div>
			<div class="level-item has-text-centered">
				<div class="box">
					<p class="heading">Donors</p>
					<p class="title">{{ projectSummary.donorIds.length }}</p>
				</div>
			</div>
			<div class="level-item has-text-centered">
				<div class="box">
					<p class="heading">Total target beneficiaries</p>
					<p class="title">{{ projectSummary.target }}</p>
				</div>
			</div>
			<div class="level-item has-text-centered">
				<div class="box">
					<p class="heading">Beneficiaries reached</p>
					<p class="title">{{ projectSummary.target }}</p>
				</div>
			</div>
		</nav>
		<hr>
	</div>
</template>

<script>
import ProjectsService from "@/services/ProjectsService";
import { Toast } from "@/utils/UI";

export default {
	name: "ProjectSummary",

	data() {
		return {
			projectSummary: null,
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
				container: this.$refs.projectSummary,
			});

			await ProjectsService.getDetailOfProject(
				this.$route.params.projectId,
			).then((response) => {
				this.projectSummary = response.data;
			}).catch((e) => { Toast(e, "is-danger"); });

			loadingComponent.close();
		},
	},
};
</script>
