<template>
	<div>
		<AssistanceList change-button :add-button="false" />
	</div>
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
