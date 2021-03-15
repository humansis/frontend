<template>
	<div>
		<h1 class="title has-text-centered">Jobs</h1>

		<b-tabs v-model="selectedTab">
			<b-tab-item
				label="Imports"
				icon="file-upload"
			>
				<ImportsPage />
			</b-tab-item>
			<b-tab-item
				label="Vouchers"
				icon="ticket-alt"
			>
				<VouchersPage />
			</b-tab-item>
		</b-tabs>
	</div>
</template>

<script>
import ImportsPage from "@/views/Jobs/ImportsPage";
import VouchersPage from "@/views/Jobs/VouchersPage";

export default {
	name: "Jobs",

	components: {
		VouchersPage,
		ImportsPage,
	},

	data() {
		return {
			selectedTab: 0,
		};
	},
};
</script>
