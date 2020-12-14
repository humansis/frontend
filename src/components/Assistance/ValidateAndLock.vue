<template>
	<BeneficiariesList
		:change-button="false"
		:add-button="false"
		:export-button="false"
	/>
</template>

<script>
import BeneficiariesList from "@/components/Assistance/BeneficiariesList";

export default {
	name: "ValidateAndLock",

	components: {
		BeneficiariesList,
	},
};
</script>
