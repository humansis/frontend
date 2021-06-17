<template>
	<CardComponent class="has-table" :title="title">
		<slot name="progress">
			<b-progress	:value="100" format="percent" />
		</slot>

		<slot name="tableHeader">
			<div class="level p-3 has-border-bottom">
				<div class="level-left">
					<slot name="search">
						<div class="level-item">
							<Search
								v-if="hasSearch"
								:backend-search="backendSearching"
								@search="onSearch"
							/>
						</div>
					</slot>
					<slot name="filterButton" />
					<slot name="export" />
					<slot name="actions" />
				</div>
				<slot name="resetSort">
					<div class="level-right">
						<b-button
							v-if="hasResetSort"
							icon-left="eraser"
							class="reset-sort-button is-small"
							@click="onResetSort"
						>
							{{ $t('Reset Sort') }}
						</b-button>
					</div>
				</slot>
			</div>
		</slot>

		<slot name="filter" />

		<b-table
			ref="table"
			hoverable
			scrollable
			selectable
			pagination-position="bottom"
			sort-icon="arrow-up"
			sort-icon-size="is-small"
			:backend-sorting="backendSorting"
			:backend-pagination="backendPagination"
			:default-sort-direction="defaultSortDirection"
			:default-sort="defaultSortKey"
			:aria-next-label="$t('Next Page')"
			:aria-previous-label="$t('Previous Page')"
			:aria-page-label="$t('Page')"
			:aria-current-label="$t('Current Page')"
			:checked-rows="checkedRows"
			:is-row-checkable="isRowCheckable"
			:paginated="paginated"
			:checkable="checkable"
			:data="preparedData"
			:total="total"
			:per-page="customPerPage || perPage"
			:current-page="currentPage"
			:pagination-simple="false"
			:loading="isLoading"
			:row-class="rowClass"
			@check="checkboxChecked"
			@cellclick="onClick"
			@page-change="$emit('pageChanged', $event)"
			@sort="$emit('sorted', $event)"
		>
			<slot />

			<template v-if="paginated" #bottom-left>
				<p style="white-space: nowrap">{{ $t('Per Page') }}: </p>
				<MultiSelect
					class="ml-2 mr-2"
					hide-selected
					open-direction="above"
					:value="perPage"
					:options="options.perPageNumbers"
					:allow-empty="false"
					:show-labels="false"
					@input="onChangePerPage"
				/>
				<p class="total-count" style="white-space: nowrap">{{ $t('Total Count') }}: </p>
				<span class="mr-1 ml-1">{{ total }}</span>
			</template>
			<template #footer>
				<slot name="footer" />
			</template>
		</b-table>
	</CardComponent>
</template>

<script>
import { mapActions, mapState } from "vuex";
import CardComponent from "@/components/CardComponent";
import Search from "@/components/Search";

export default {
	name: "Table",

	components: {
		CardComponent,
		Search,
	},

	props: {
		title: String,
		data: Array,
		columns: Array,
		total: Number,
		currentPage: Number,
		paginated: {
			type: Boolean,
			default: true,
		},
		defaultSortDirection: {
			type: String,
			default: "desc",
		},
		defaultSortKey: {
			type: String,
			default: "id",
		},
		backendSorting: {
			type: Boolean,
			default: true,
		},
		backendSearching: {
			type: Boolean,
			default: true,
		},
		backendPagination: {
			type: Boolean,
			default: true,
		},
		checkable: {
			type: Boolean,
			default: false,
		},
		checkedRows: {
			type: Array,
			default: () => [],
		},
		disablePrecheckedRows: {
			type: Boolean,
			default: false,
		},
		rowClass: {
			type: Function,
			default: () => "",
		},
		isLoading: {
			type: Boolean,
			default: false,
		},
		hasResetSort: {
			type: Boolean,
			default: false,
		},
		hasSearch: {
			type: Boolean,
			default: false,
		},
		customPerPage: {
			type: Number,
			default: null,
		},
	},

	data() {
		return {
			options: {
				perPageNumbers: [10, 20, 50, 100],
			},
			searchedData: null,
		};
	},

	computed: {
		...mapState(["perPage"]),

		preparedData() {
			if (this.backendSearching || this.searchedData === null) {
				return this.data;
			}
			return this.searchedData;
		},
	},

	methods: {
		...mapActions(["storePerPage"]),

		onClick(row, column) {
			if (column.field !== "actions") {
				this.$emit("clicked", row);
			}
		},

		checkboxChecked(rows) {
			if (this.disablePrecheckedRows) {
				const immediatelyCheckedRows = this.checkedRows.map((row) => row.id);
				const checkedNewRows = rows.filter((row) => !immediatelyCheckedRows.includes(row.id));

				this.$emit("checked", checkedNewRows);
			} else {
				this.$emit("checked", rows);
			}
		},

		isRowCheckable(row) {
			if (row.removed) return false;
			if (this.disablePrecheckedRows) {
				const immediatelyCheckedRows = this.checkedRows.map((checkedRow) => checkedRow?.id);
				return !immediatelyCheckedRows.includes(row.id);
			}

			return true;
		},

		onChangePerPage(value) {
			this.storePerPage(value);
			this.$emit("pageChanged");
		},

		onResetSort() {
			this.$refs.table.resetMultiSorting();
			this.$emit("resetSort");
		},

		onSearch(event) {
			if (this.backendSearching) {
				this.$emit("search", event);
			} else {
				if (!event) this.searchedData = this.data;
				this.searchedData = this.data.filter((item) => {
					let includes = false;
					Object.keys(item).forEach((key) => {
						if (!includes) {
							const column = this.columns.find((value) => value.key === key);
							if (column && column.searchable) {
								includes = !!String(item[key]).toLowerCase().includes(event.toLowerCase());
							}
						}
					});
					return includes;
				});
			}
		},
	},
};
</script>
