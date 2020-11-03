<template>
	<div>
		<b-tabs size="is-medium">
			<b-tab-item
				label="Country Report"
				icon="country-report">
				<CountryReportList />
			</b-tab-item>
			<b-tab-item
				label="Project Report"
				icon="project-report">
				<ProjectReportList />
			</b-tab-item>
			<b-tab-item
				label="Distribution Report"
				icon="distribution-report">
				<DistributionReportList />
			</b-tab-item>
		</b-tabs>
	</div>
</template>

<script>
import CountryReportList from "@/components/Reports/CountryReportList";
import ProjectReportList from "@/components/Reports/ProjectReportList";
import DistributionReportList from "@/components/Reports/DistributionReportList";

export default {
	name: "ReportsTab",

	components: {
		CountryReportList,
		ProjectReportList,
		DistributionReportList,
	},

	data() {
		return {
			selectedTab: CountryReportList,
		};
	},

	methods: {
		// changeTab(tab) {
		// 	switch (tab) {
		// 		case "country-report":
		// 			this.selectedTab = CountryReportList;
		// 			break;
		// 		case "project-report":
		// 			this.selectedTab = ProjectReportList;
		// 			break;
		// 		case "distribution-report":
		// 			this.selectedTab = DistributionReportList;
		// 			break;
		// 		default:
		// 			break;
		// 	}
		// },
	},
};
</script>

<style scoped>

</style>
