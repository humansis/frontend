<template>
	<div>
		<GoBackButton />
		<InstitutionSummary />
	</div>
</template>

<script>
import GoBackButton from "@/components/GoBackButton";
import InstitutionSummary from "@/components/Beneficiaries/InstitutionSummary";

export default {
	name: "Institution",

	components: {
		InstitutionSummary,
		GoBackButton,
	},
};
</script>
