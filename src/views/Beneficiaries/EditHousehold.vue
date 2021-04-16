<template>
	<div>
		<h2 class="title">{{ $t('Edit Household') }}</h2>
		<HouseholdTabs is-editing />
	</div>
</template>

<script>
import HouseholdTabs from "@/components/Beneficiaries/Household/HouseholdTabs";

export default {
	name: "EditHousehold",

	components: {
		HouseholdTabs,
	},
};
</script>
