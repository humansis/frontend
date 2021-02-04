<template>
	<div v-if="projectSummary" ref="projectSummary">
		<h2 class="title has-text-centered">
			{{ projectSummary.name }}
		</h2>
		<nav class="level is-mobile">
			<div class="level-item has-text-centered">
				<div class="box">
					<p class="heading">Sectors</p>
					<p class="title">{{ projectSummary.sectors.length }}</p>
				</div>
			</div>

			<div class="level-item has-text-centered">
				<div class="box">
					<p class="heading">Start Date</p>
					<p class="title">{{ new Date(projectSummary.startDate).toLocaleDateString() }}</p>
				</div>
			</div>

			<div class="level-item has-text-centered">
				<div class="box">
					<p class="heading">End Date</p>
					<p class="title">{{ new Date(projectSummary.endDate).toLocaleDateString() }}</p>
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
import { mapState } from "vuex";
import ProjectsService from "@/services/ProjectsService";
import { Notification } from "@/utils/UI";

export default {
	name: "ProjectSummary",

	data() {
		return {
			projectSummary: null,
		};
	},

	computed: {
		...mapState(["temporaryProject"]),
	},

	async mounted() {
		if (this.temporaryProject) {
			this.projectSummary = this.temporaryProject;
		} else {
			await this.fetchData();
		}
	},

	methods: {
		async fetchData() {
			await ProjectsService.getDetailOfProject(
				this.$route.params.projectId,
			).then(({ data }) => {
				this.projectSummary = data;
			}).catch((e) => {
				Notification(`Detail Of Project ${e}`, "is-danger");
			});
		},
	},
};
</script>
