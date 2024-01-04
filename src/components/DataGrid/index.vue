<template>
	<v-card :variant="variant">
		<v-row v-if="!isHeaderDisabled" class="mt-1 mb-1">
			<v-col cols="7" lg="9" class="d-flex flex-wrap gr-3 align-center">
				<Search
					v-if="isSearchVisible"
					ref="search"
					:search-phrase="searchPhrase"
					:search-fields="searchFields"
					:default-search-field="defaultSearchField"
					:is-disabled="isSearchDisabled"
					class="ml-4"
					@search="$emit('search', $event)"
				/>

				<slot name="tableControls" />
			</v-col>

			<v-col cols="5" lg="3">
				<div v-if="resetSortButton || resetFiltersButton" class="text-end mr-4 ml-2">
					<div>
						<v-btn
							v-if="resetFiltersButton"
							color="grey-lighten-2"
							prepend-icon="eraser"
							size="x-small"
							@click="$emit('resetFilters')"
						>
							{{ $t('Reset Filters') }}
						</v-btn>
					</div>

					<div>
						<v-btn
							v-if="resetSortButton"
							color="grey-lighten-2"
							prepend-icon="eraser"
							size="x-small"
							class="mt-2"
							@click="$emit('resetSort')"
						>
							{{ $t('Reset Table Sort') }}
						</v-btn>
					</div>
				</div>
			</v-col>
		</v-row>

		<slot name="advancedControls" />

		<v-data-table
			v-bind="$attrs"
			:cell-props="getCellProps"
			@[rowClickEvent]="onHandleRowClick"
		>
			<template v-slot:loader>
				<v-progress-linear
					:indeterminate="progress ? null : true"
					:model-value="progress ?? null"
				/>

				<v-skeleton-loader :type="`table-row@${perPage}`" />
			</template>

			<template v-if="!showDefaultFooter" v-slot:bottom>
				<v-row v-if="!isFooterDisabled" class="align-center ma-2 pa-0 table-footer">
					<v-col class="per-page-col">
						<DataSelect
							v-model="perPage"
							:items="TABLE.PER_PAGE_OPTIONS"
							:is-clearable="false"
							name="per-page"
							class="per-page mr-5"
							label="Per page"
							@update:modelValue="onPerPageChanged"
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

					<v-col v-if="selectedRows > 0" class="item-selected-col">
						<v-chip
							label=""
							color="light-blue-darken-2"
							class="rounded-s-lg rounded-be-0 rounded-te-0"
						>
							{{ $t('Items Selected') }}
						</v-chip>

						<v-chip
							label=""
							color="grey-darken-1"
							class="rounded-e-lg rounded-bs-0 rounded-ts-0"
						>
							{{ selectedRows }}
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
							@click:appendInner="onGoToPage"
						/>
					</v-col>
				</v-row>
			</template>

			<template
				v-for="(column, headerIndex) in $attrs.headers"
				v-slot:[`item.${column.key}`]="{ item, index }"
				:key="headerIndex"
			>
				<template v-if="column.key === 'actions'">
					<div :class="['table-actions', { 'removed-row': item.removed }]">
						<slot name="actions" :row="item" :index="index" />
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
	name: "DataGrid",

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

		resetFiltersButton: {
			type: Boolean,
			default: false,
		},

		totalCount: {
			type: Number,
			default: 0,
		},

		currentPage: {
			type: Number,
			default: 1,
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

		progress: {
			type: Number,
			default: null,
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

		isHeaderDisabled: {
			type: Boolean,
			default: false,
		},

		isFooterDisabled: {
			type: Boolean,
			default: false,
		},

		showDefaultFooter: {
			type: Boolean,
			default: false,
		},

		selectedRows: {
			type: Number,
			default: 0,
		},

		variant: {
			type: String,
			default: "elevated",
		},
	},

	data() {
		return {
			TABLE,
			rowClickEvent: this.isRowClickDisabled ? null : "click:row",
			page: this.currentPage,
			perPage: this.$attrs["items-per-page"],
		};
	},

	computed: {
		pageCount() {
			return Math.ceil(this.totalCount / this.perPage);
		},
	},

	methods: {
		onHandleRowClick(clickEvent, row) {
			this.$emit("rowClicked", row);
		},

		onPerPageChanged() {
			if (this.pageCount < this.page) {
				this.page = 1;
				this.$emit("perPageChanged", { currentPerPage: this.perPage, currentPage: this.page });
			}

			this.$emit("perPageChanged", { currentPerPage: this.perPage });
		},

		onGoToPage() {
			if (this.page <= this.pageCount) {
				this.$emit("pageChanged", this.page);
				return;
			}

			this.page = this.pageCount;
			this.$emit("pageChanged", this.pageCount);
		},

		getCellProps(data) {
			return { class: data.item.removed ? "removed-row" : "" };
		},

		resetSearch() {
			this.$refs.search.clearSearch();
		},

		searchValue() {
			return this.$refs.search.value;
		},
	},
};
</script>

<style lang="scss">
.removed-row {
	background-color: #f3f3f3;
}
</style>
