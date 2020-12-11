<template>
	<AssistanceList
		change-button
		export-button
		:add-button="false"
	/>
</template>

<script>
import AssistanceList from "@/components/Assistance/BeneficiariesList";

export default {
	name: "ExportRandomSample",

	components: {
		AssistanceList,
	},
};
</script>
