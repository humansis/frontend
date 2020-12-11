<template>
	<AssistanceList
		:change-button="false"
		:add-button="false"
		:export-button="false"
	/>
</template>

<script>
import AssistanceList from "@/components/Assistance/BeneficiariesList";

export default {
	name: "ValidateAndLock",

	components: {
		AssistanceList,
	},
};
</script>
