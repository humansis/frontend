<template>
	<div ref="assistanceSummary">
		<h2 class="title has-text-centered">
			{{ assistance.name }}
		</h2>
		<h3 class="subtitle has-text-centered">
			Last Modified : 12-05-1909 07:55
		</h3>
		<nav class="level is-mobile">
			<div class="level-item has-text-centered">
				<div class="box">
					<p class="heading">Province</p>
					<p class="title">{{ provinceName }}</p>
				</div>
			</div>

			<div class="level-item has-text-centered">
				<div class="box">
					<p class="heading">Beneficiaries</p>
					<p class="title">{{ beneficiaries }}</p>
				</div>
			</div>

			<div class="level-item has-text-centered">
				<div class="box">
					<p class="heading">Date Of Distribution</p>
					<p class="title">{{ assistance.dateDistribution}}</p>
				</div>
			</div>

			<div class="level-item has-text-centered">
				<div class="box">
					<p class="heading">Project</p>
					<p class="title">{{ projectName }}</p>
				</div>
			</div>

			<div class="level-item has-text-centered">
				<div class="box">
					<p class="heading">Target</p>
					<p class="title">{{ assistanceTarget }}</p>
				</div>
			</div>

			<div class="level-item has-text-centered">
				<div class="box">
					<p class="heading">Commodity</p>
					<p class="title">{{ commodityName }}</p>
				</div>
			</div>
		</nav>
		<hr>
	</div>
</template>

<script>
import ProjectsService from "@/services/ProjectsService";
import LocationsService from "@/services/LocationsService";
import AssistancesService from "@/services/AssistancesService";
import { normalizeText } from "@/utils/datagrid";

export default {
	name: "ProjectSummary",

	props: {
		assistance: Object,
		beneficiaries: Number,
	},
	data() {
		return {
			project: null,
			province: null,
			commodity: null,
		};
	},

	async mounted() {
		await this.fetchCommodity();
		await this.fetchProject();
		await this.fetchLocation();
	},

	computed: {
		assistanceTarget() {
			return normalizeText(this.assistance.target);
		},

		provinceName() {
			if (this.province) {
				return this.province.name;
			}
			return "";
		},

		projectName() {
			if (this.project) {
				return this.project.name;
			}
			return "";
		},

		commodityName() {
			if (this.commodity) {
				return this.commodity.modalityType;
			}
			return "";
		},
	},

	methods: {
		async fetchProject() {
			await ProjectsService.getDetailOfProject(
				this.$route.params.projectId,
			).then(({ data }) => { this.project = data; });
		},

		async fetchLocation() {
			await LocationsService.getDetailOfAdm1(
				this.assistance.adm1Id,
			).then(({ data }) => { this.province = data; });
		},

		async fetchCommodity() {
			await AssistancesService.getAssistanceCommodities(
				this.$route.params.assistanceId,
			).then(({ data: [a] }) => {
				this.commodity = a;
			});
		},
	},
};
</script>
