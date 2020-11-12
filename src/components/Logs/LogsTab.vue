<template>
	<div>
		<b-tabs v-model="selectedTab" size="is-medium">
			<b-tab-item
				label="Distributions"
				icon="clipboard"
			>
				<DistributionsLogList />
			</b-tab-item>
			<b-tab-item
				label="Beneficiaries"
				icon="users"
			>
				<BeneficiariesLogList />
			</b-tab-item>
			<b-tab-item
				label="Vouchers"
				icon="ticket-alt"
			>
				<VouchersLogList />
			</b-tab-item>
			<b-tab-item
				label="Administrative Settings"
				icon="wrench"
			>
				<AdministrativeSettingsLogList />
			</b-tab-item>
			<b-tab-item
				label="Other"
				icon="box"
			>
				<OtherLogList />
			</b-tab-item>
			<b-tab-item
				label="Reports"
				icon="chart-line"
			>
				<ReportsLog v-if="loadedReports" />
			</b-tab-item>
		</b-tabs>
	</div>
</template>

<script>
import DistributionsLogList from "@/components/Logs/DistributionsLogList";
import BeneficiariesLogList from "@/components/Logs/BeneficiariesLogList";
import VouchersLogList from "@/components/Logs/VouchersLogList";
import AdministrativeSettingsLogList from "@/components/Logs/AdministrativeSettingsLogList";
import OtherLogList from "@/components/Logs/OtherLogList";
import ReportsLog from "@/components/Logs/ReportsLog";

export default {
	name: "LogsTab",

	components: {
		ReportsLog,
		OtherLogList,
		AdministrativeSettingsLogList,
		VouchersLogList,
		BeneficiariesLogList,
		DistributionsLogList,
	},

	data() {
		return {
			loadedReports: false,
			selectedTab: 0,
		};
	},

	watch: {
		selectedTab(value) {
			if (value === 5) {
				this.loadedReports = true;
			}
		},
	},
};
</script>
