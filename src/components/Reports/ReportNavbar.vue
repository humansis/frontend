<template>
	<div class="columns">
		<PeriodFilter class="column is-four-fifths" />

		<ExportButton
			class="column is-one-fifth ml-6"
			type="is-success"
			size="is-default"
			:formats="{ xlsx: true, csv: true, ods: true, pdf: true}"
		/>
	</div>
</template>

<script>
import ExportButton from "@/components/ExportButton";
import PeriodFilter from "@/components/Reports/PeriodFilter";

export default {
	name: "ReportNavbar",

	components: {
		ExportButton,
		PeriodFilter,
	},
};
</script>

<style scoped>

</style>
