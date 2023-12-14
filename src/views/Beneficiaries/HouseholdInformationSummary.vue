<template>
	<v-container fluid>
		<div class="d-flex mb-4">
			<h2 class="me-auto">{{ $t('HouseholdInformationSummary') }} {{ $route.params.householdId }}</h2>
		</div>
	</v-container>
</template>

<script>
export default {
	name: "EditHousehold",
};
</script>
