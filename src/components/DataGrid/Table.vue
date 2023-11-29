<template>
	<v-card>
		<div class="mt-3 mb-3">
			<v-row>
				<v-col class="d-flex flex-wrap gr-3">
					<slot name="table-header" />
				</v-col>

				<v-col>
					<div v-if="resetSortButton" class="text-end mr-5">
						<v-btn
							color="grey-lighten-2"
							prepend-icon="eraser"
							size="x-small"
						>
							{{ $t('Reset Sort') }}
						</v-btn>
					</div>
				</v-col>
			</v-row>
		</div>

		<v-data-table
			v-bind="$attrs"
		>
			<template
				v-for="(column, index) in $attrs.headers"
				v-slot:[`item.${column.key}`]="{ item }"
				:key="index"
			>
				<ColumnField :column="column" :cell-data="item[column.key]" />
			</template>
		</v-data-table>
	</v-card>
</template>

<script>
import ColumnField from "@/components/DataGrid/ColumnField";
import vuetifyHelper from "@/mixins/vuetifyHelper";

export default {
	name: "Table",

	components: {
		ColumnField,
	},

	mixins: [vuetifyHelper],

	inheritAttrs: false,

	props: {
		resetSortButton: {
			type: Boolean,
			default: false,
		},
	},
};
</script>
