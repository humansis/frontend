<!-- TODO Not used for now -->
<template>
	<div>
		<h1 class="title has-text-centered">Reports</h1>

		<b-tabs v-model="selectedTab">
			<b-tab-item
				v-if="userCan.countryReport"
				label="Country Report"
				icon="th-large"
			>
				<CountryReportList />
			</b-tab-item>
			<b-tab-item
				v-if="userCan.projectReport"
				label="Project Report"
				icon="clipboard"
			>
				<ProjectReportList :projects="projects" />
			</b-tab-item>
			<b-tab-item
				v-if="userCan.distributionReport"
				label="Assistance Report"
				icon="box"
			>
				<AssistanceReportList :projects="projects" />
			</b-tab-item>
		</b-tabs>
	</div>
</template>

<script>
import CountryReportList from "@/components/Reports/CountryReportList";
import ProjectService from "@/services/ProjectService";
import { Notification } from "@/utils/UI";
import permissions from "@/mixins/permissions";

const ProjectReportList = () => import("@/components/Reports/ProjectReportList");
const AssistanceReportList = () => import("@/components/Reports/AssistanceReportList");

export default {
	name: "ReportsPage",

	components: {
		CountryReportList,
		ProjectReportList,
		AssistanceReportList,
	},

	mixins: [permissions],

	mounted() {
		this.fetchProjects();
	},

	data() {
		return {
			selectedTab: 0,
			projects: [],
		};
	},

	methods: {
		async fetchProjects() {
			await ProjectService.getListOfProjects()
				.then((response) => { this.projects = response.data; }).catch((e) => {
					if (e.message) Notification(`Projects ${e}`, "is-danger");
				});
		},
	},

};
</script>
