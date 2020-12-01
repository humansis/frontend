<template>
	<div>
		<h2 class="title">Add Households</h2>
		<HouseholdTabs :is-editing="false" />
	</div>
</template>

<script>
import HouseholdTabs from "@/components/Beneficiaries/Household/HouseholdTabs";

export default {
	name: "AddHousehold",

	components: {
		HouseholdTabs,
	},
};
</script>
