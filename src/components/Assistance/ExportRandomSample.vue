<template>
	<AssistanceList
		change-button
		export-button
		:add-button="false"
	/>
</template>

<script>
import AssistanceList from "@/components/Assistance/AssistanceList";

export default {
	name: "ExportRandomSample",

	components: {
		AssistanceList,
	},
};
</script>
