<template>
	<div class="columns">
		<PeriodFilter
			ref="periodFilter"
			class="column is-two-fifths"
			@periodChanged="$emit('periodChanged', $event)"
			@choosePeriodChanged="$emit('choosePeriodChanged', $event)"
		/>
		<ExportButton
			class="column m-2"
			type="is-success"
			space-between
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
