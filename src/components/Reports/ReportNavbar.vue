<template>
	<div class="level">
		<div class="level-left">
			<PeriodFilter
				ref="periodFilter"
				@periodChanged="$emit('periodChanged', $event)"
				@choosePeriodChanged="$emit('choosePeriodChanged', $event)"
			/>
		</div>

		<div class="level-right">
			<ExportButton :formats="{ xlsx: true, csv: true, ods: true, pdf: true}" />
		</div>
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
