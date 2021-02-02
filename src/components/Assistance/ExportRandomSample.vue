<template>
	<BeneficiariesList
		change-button
		export-button
		:add-button="false"
	/>
</template>

<script>
import BeneficiariesList from "@/components/Assistance/BeneficiariesList";

export default {
	name: "ExportRandomSample",

	components: {
		BeneficiariesList,
	},
};
</script>
