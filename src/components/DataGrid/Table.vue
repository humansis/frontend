<template>
	<v-card>
		<v-row class="mt-1 mb-1">
			<v-col cols="8" class="d-flex flex-wrap gr-3 align-center">
				<Search
					v-if="isSearchVisible"
					:search-phrase="searchPhrase"
					:search-fields="searchFields"
					:default-search-field="defaultSearchField"
					:is-disabled="isSearchDisabled"
					ref="search"
					class="ml-4"
					@search="$emit('search', $event)"
				/>

				<slot name="export" />
				<slot name="filterButton" />
				<slot name="table-header" />
			</v-col>

			<v-col cols="4">
				<div v-if="resetSortButton" class="text-end mr-5">
					<v-btn
						color="grey-lighten-2"
						prepend-icon="eraser"
						size="x-small"
						@click="$emit('resetSort')"
					>
						{{ $t('Reset Table Sort') }}
					</v-btn>
				</div>
			</v-col>
		</v-row>

		<slot name="filter" />

		<v-data-table
			v-bind="$attrs"
			:cell-props="getCellProps"
			hide-default-footer
			@[rowClickEvent]="handleRowClick"
		>
			<template v-slot:bottom>
				<v-row v-if="!isFooterDisabled" class="align-center ma-2 pa-0 table-footer">
					<v-col class="per-page-col">
						<DataSelect
							v-model="perPage"
							:items="TABLE.PER_PAGE_OPTIONS"
							:is-clearable="false"
							name="per-page"
							class="per-page mr-5"
							label="Per page"
							@update:modelValue="perPageChanged"
						/>
					</v-col>

					<v-col class="total-count-col">
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

					<v-col class="pagination-col">
						<v-pagination
							v-model="page"
							:length="pageCount"
							class="mr-3"
							@update:modelValue="$emit('pageChanged', $event)"
						/>
					</v-col>

					<v-col class="go-page-col">
						<DataInput
							v-model.number="page"
							type="number"
							min="0"
							label="Go to page"
							append-inner-icon="arrow-right"
							class="go-to-page"
							hide-spin-buttons
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
				<template v-if="column.key === 'actions'">
					<div :class="['table-actions', { 'removed-row': item.removed }]">
						<slot name="actions" :row="item" />
					</div>
				</template>

				<template v-else>
					<ColumnField :column="column" :cell-data="item[column.key]" />
				</template>
			</template>
		</v-data-table>
	</v-card>
</template>

<script>
import ColumnField from "@/components/DataGrid/ColumnField";
import DataInput from "@/components/Inputs/DataInput";
import DataSelect from "@/components/Inputs/DataSelect";
import Search from "@/components/Inputs/Search";
import vuetifyHelper from "@/mixins/vuetifyHelper";
import { TABLE } from "@/consts/index";

export default {
	name: "Table",

	components: {
		ColumnField,
		DataSelect,
		DataInput,
		Search,
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

		searchPhrase: {
			type: String,
			default: "",
		},

		searchFields: {
			type: Array,
			default: () => [],
		},

		defaultSearchField: {
			type: Object,
			default: () => ({}),
		},

		isSearchDisabled: {
			type: Boolean,
			default: false,
		},

		isSearchVisible: {
			type: Boolean,
			default: false,
		},

		isRowClickDisabled: {
			type: Boolean,
			default: false,
		},

		isFooterDisabled: {
			type: Boolean,
			default: false,
		},
	},

	data() {
		return {
			TABLE,
			rowClickEvent: this.isRowClickDisabled ? null : "click:row",
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
		handleRowClick(clickEvent, row) {
			this.$emit("rowClicked", row);
		},

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

		getCellProps(data) {
			if (data.item.removed) {
				return { class: "removed-row" };
			}

			return { class: "" };
		},
	},
};
</script>

<style lang="scss">
.removed-row {
	background-color: #f3f3f3;
}
</style>
