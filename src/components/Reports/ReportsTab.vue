<template>
	<div>
		<b-tabs size="is-medium">
			<b-tab-item
				label="Country Report"
				icon="th-large">
				<CountryReportList />
			</b-tab-item>
			<b-tab-item
				label="Project Report"
				icon="clipboard">
				<ProjectReportList />
			</b-tab-item>
			<b-tab-item
				label="Distribution Report"
				icon="box">
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

};
</script>
