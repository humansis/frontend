<template>
	<div>
		<AssistanceSummary />
		<b-tabs v-model="selectedTabIndex" size="is-medium">
			<b-tab-item
				label="Assistance List Of Beneficiaries"
				icon="list"
			>
				<AssistanceList add-button :change-button="false" />
			</b-tab-item>
			<b-tab-item
				label="Import & Compare"
				icon="file-import"
			>
				<ImportAndCompare />
			</b-tab-item>
			<b-tab-item
				label="Export Random Sample"
				icon="file-export"
			>
				<ExportRandomSample />
			</b-tab-item>
			<b-tab-item
				label="Validate & Lock"
				icon="lock"
			>
				<ValidateAndLock />
			</b-tab-item>
		</b-tabs>
		<div class="has-text-right">
			<b-button
				v-if="selectedTabIndex !== 3"
				type="is-success"
				@click="goToNextTab"
			>
				Next
			</b-button>
			<b-button
				v-if="selectedTabIndex === 3"
				icon-left="lock"
				type="is-danger"
			>
				Validate
			</b-button>
		</div>
	</div>
</template>

<script>
import AssistanceSummary from "@/components/Assistance/AssistanceSummary";
import AssistanceList from "@/components/Assistance/AssistanceList";
import ImportAndCompare from "@/components/Assistance/ImportAndCompare";
import ExportRandomSample from "@/components/Assistance/ExportRandomSample";
import ValidateAndLock from "@/components/Assistance/ValidateAndLock";

export default {
	name: "AddAssistance",

	components: {
		AssistanceSummary,
		AssistanceList,
		ImportAndCompare,
		ExportRandomSample,
		ValidateAndLock,
	},

	data() {
		return {
			selectedTabIndex: 0,
		};
	},

	methods: {
		goToNextTab() {
			if (this.selectedTabIndex <= 3) {
				this.selectedTabIndex += 1;
			}
		},
	},
};
</script>
