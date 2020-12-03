<template>
	<div>
		<b-tabs size="is-medium">
			<b-tab-item
				label="Country Report"
				icon="th-large"
			>
				<ReportNavbar />
				<CountryReportList />
			</b-tab-item>
			<b-tab-item
				label="Project Report"
				icon="clipboard"
			>
				<ReportNavbar />
				<ProjectReportList />
			</b-tab-item>
			<b-tab-item
				label="Distribution Report"
				icon="box"
			>
				<ReportNavbar />
				<DistributionReportList />
			</b-tab-item>
		</b-tabs>
	</div>
</template>

<script>
import CountryReportList from "@/components/Reports/CountryReportList";
import ProjectReportList from "@/components/Reports/ProjectReportList";
import DistributionReportList from "@/components/Reports/DistributionReportList";
import ReportNavbar from "@/components/Reports/ReportNavbar";

export default {
	name: "Reports",

	components: {
		ReportNavbar,
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
