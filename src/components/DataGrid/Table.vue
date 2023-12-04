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
			:hide-default-footer="true"
		>
			<template v-slot:bottom>
				<v-row class="align-center ma-3">
					<v-col class="per-page">
						<v-select
							v-model="perPage"
							:items="TABLE.PER_PAGE_OPTIONS"
							variant="outlined"
							density="compact"
							class="per-page mr-5"
							label="Per page"
							hide-details
							@update:modelValue="perPageChanged"
						/>
					</v-col>

					<v-col class="max-width-100">
						<v-chip
							label=""
							color="light-blue-darken-2"
							class="rounded-s-lg rounded-be-0 rounded-te-0"
						>
							{{ $t('Total Count') }}
						</v-chip>

						<v-chip
							label=""
							color="grey-darken-1"
							class="rounded-e-lg rounded-bs-0 rounded-ts-0"
						>
							{{ totalCount }}
						</v-chip>

					</v-col>

					<v-col offset="5" class="max-width-100">
						<v-pagination
							v-model="page"
							:length="pageCount"
							class="mr-3"
							@update:modelValue="$emit('pageChanged', $event)"
						/>
					</v-col>

					<v-col class="go-to-page">
						<v-text-field
							v-model.number="page"
							type="number"
							step="any"
							min="0"
							variant="outlined"
							density="compact"
							label="Go to page"
							append-inner-icon="arrow-right"
							:hide-spin-buttons="true"
							hide-details
							dense
							@click:appendInner="goToPage"
						/>
					</v-col>
				</v-row>
			</template>

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
import { TABLE } from "@/consts/index";

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

		totalCount: {
			type: Number,
			default: 0,
		},
	},

	data() {
		return {
			TABLE,
			page: 1,
			perPage: this.$attrs["items-per-page"],
		};
	},

	computed: {
		pageCount() {
			return Math.ceil(this.totalCount / this.perPage);
		},
	},

	methods: {
		perPageChanged() {
			if (this.pageCount === 1 && this.page > 1) {
				this.page = 1;
				this.$emit("perPageChanged", { currentPerPage: this.perPage, currentPage: this.page });
			}

			this.$emit("perPageChanged", { currentPerPage: this.perPage });
		},

		goToPage() {
			if (this.page <= this.pageCount) {
				this.$emit("pageChanged", this.page);
				return;
			}

			this.page = this.pageCount;
			this.$emit("pageChanged", this.pageCount);
		},
	},
};
</script>

<style lang="scss">
.per-page, .go-to-page {
	min-width: 70px;
	max-width: 130px;
}

.max-width-100 {
	max-width: 500px;
}
</style>
