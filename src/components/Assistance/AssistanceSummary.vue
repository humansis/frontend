<template>
	<div v-if="assistance" ref="assistanceSummary">
		<h2 class="title has-text-centered">
			{{ assistance.name }}
		</h2>
		<nav class="level">
			<div class="level-item has-text-centered">
				<div class="box">
					<p class="heading">Province</p>
					<p v-if="provinceName" class="has-text-weight-bold is-size-5">{{ provinceName }}</p>
					<Loading v-else type="bubbles" is-normal />
				</div>
			</div>

			<div class="level-item has-text-centered">
				<div class="box">
					<p class="heading">Beneficiaries</p>
					<p v-if="beneficiaries" class="has-text-weight-bold is-size-5">{{ beneficiaries }}</p>
					<Loading v-else type="bubbles" is-normal />
				</div>
			</div>

			<div class="level-item has-text-centered">
				<div class="box">
					<p class="heading">Date Of Distribution</p>
					<p
						v-if="assistance.dateDistribution"
						class="has-text-weight-bold is-size-5"
					>
						{{ assistance.dateDistribution }}
					</p>
					<Loading v-else type="bubbles" is-normal />
				</div>
			</div>

			<div class="level-item has-text-centered">
				<div class="box">
					<p class="heading">Project</p>
					<p v-if="projectName" class="has-text-weight-bold is-size-5">{{ projectName }}</p>
					<Loading v-else type="bubbles" is-normal />
				</div>
			</div>

			<div class="level-item has-text-centered">
				<div class="box">
					<p class="heading">Target</p>
					<p
						v-if="assistanceTarget"
						class="has-text-weight-bold is-size-5"
					>
						{{ assistanceTarget }}
					</p>
					<Loading v-else type="bubbles" is-normal />
				</div>
			</div>

			<div class="level-item has-text-centered">
				<div class="box">
					<p class="heading">Commodity</p>
					<p
						v-if="assistance.commodity"
						class="has-text-weight-bold is-size-5"
					>
						{{ assistance.commodity }}
					</p>
					<Loading v-else type="bubbles" is-normal />
				</div>
			</div>
		</nav>
		<hr>
	</div>
</template>

<script>
import { mapState } from "vuex";
import Loading from "@/components/Loading";
import ProjectsService from "@/services/ProjectsService";
import LocationsService from "@/services/LocationsService";
import AssistancesService from "@/services/AssistancesService";
import { normalizeText } from "@/utils/datagrid";

export default {
	name: "AssistanceSummary",

	components: {
		Loading,
	},

	props: {
		beneficiaries: Number,
	},

	data() {
		return {
			project: null,
			province: null,
			commodity: null,
			assistance: null,
		};
	},

	async mounted() {
		// TODO check after BE implements /assistances/:id endpoint
		if (this.temporaryAssistance) {
			this.assistance = this.temporaryAssistance;
		} else {
			this.assistance = await this.fetchAssistance();
		}
		this.$emit("assistanceLoaded", this.assistance);
		if (this.temporaryProject) {
			this.project = this.temporaryProject;
		} else {
			await this.fetchProject();
		}
		await this.fetchLocation();
	},

	computed: {
		...mapState(["temporaryAssistance", "temporaryProject"]),

		assistanceTarget() {
			return normalizeText(this.assistance?.target);
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
	},

	methods: {
		async fetchProject() {
			await ProjectsService.getDetailOfProject(
				this.$route.params.projectId,
			).then(({ data }) => {
				this.project = data;
			});
		},

		async fetchLocation() {
			if (!this.assistance) return;
			await LocationsService.getDetailOfAdm1(
				this.assistance.adm1Id,
			).then(({ data }) => {
				this.province = data;
			});
		},

		async fetchAssistance() {
			return AssistancesService.getDetailOfAssistance(
				this.$route.params.assistanceId,
			).then((data) => data);
		},
	},
};
</script>
