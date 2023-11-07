<!-- TODO Not used for now -->
<template>
	<div>
		<h1 class="title has-text-centered">Logs</h1>

		<b-tabs v-model="selectedTab">
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
				<ReportsLog />
			</b-tab-item>
		</b-tabs>
	</div>
</template>

<script>
import AdministrativeSettingsLogList from "@/components/Logs/AdministrativeSettingsLogList";
import BeneficiariesLogList from "@/components/Logs/BeneficiariesLogList";
import DistributionsLogList from "@/components/Logs/DistributionsLogList";
import OtherLogList from "@/components/Logs/OtherLogList";
import ReportsLog from "@/components/Logs/ReportsLog";
import VouchersLogList from "@/components/Logs/VouchersLogList";

export default {
	name: "Logs",

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
			selectedTab: 0,
		};
	},
};
</script>
