<template>
	<div>
		<AssistanceSummary />
		<b-tabs size="is-medium">
			<b-tab-item
				label="Assistance List"
				icon="list"
			>
				<AssistanceList />
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
		};
	},

	methods: {

	},
};
</script>
