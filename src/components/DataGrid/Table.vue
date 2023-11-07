<template>
	<CardComponent class="has-table" :title="title">
		<slot name="progress" />

		<slot name="tableHeader" v-if="showTableHeader">
			<div class="level p-3 has-border-bottom">
				<div class="level-left">
					<slot name="search">
						<div v-if="hasSearch" class="level-item">
							<Search
								ref="search"
								:search-phrase="searchPhrase"
								:search-fields="searchFields"
								:default-search-field="defaultSearchField"
								:is-disabled="!isSearchVisible"
								class="mr-3"
								@search="onSearch"
							/>
						</div>
					</slot>
					<slot name="title" />
					<slot name="export" />
					<slot name="exportMessage" />
					<div class="filter-button">
						<slot name="filterButton" />
					</div>
					<slot name="bulkSearchButton" />
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
			:data="data"
			:total="total"
			:per-page="customPerPage || perPage"
			:current-page="currentPage"
			:pagination-simple="false"
			:loading="isLoading"
			:class="{ 'has-clickable-rows' : hasClickableRows } "
			:row-class="rowClass"
			@check="checkboxChecked"
			@cellclick="onClick"
			@page-change="$emit('pageChanged', $event)"
			@sort="$emit('sorted', $event)"
		>
			<slot />

			<template #empty>
				<b-notification
					class="notification-no-data"
					type="is-light"
					has-icon
					icon="eye-slash"
					:closable="false"
				>
					<span class="mt-3">{{ $t(noDataMessage) }}</span>
				</b-notification>
			</template>

			<template v-if="paginated" #bottom-left>
				<p>{{ $t('Per Page') }}: </p>
				<MultiSelect
					class="per-page-select ml-2 mr-4"
					hide-selected
					open-direction="above"
					:value="perPage"
					:options="options.perPageNumbers"
					:allow-empty="false"
					:show-labels="false"
					@input="onChangePerPage"
				>
					<span slot="noOptions">{{ $t("List is empty")}}</span>
				</MultiSelect>
				<div class="mr-3">
					<b-taglist attached>
						<b-tag size="is-medium" type="is-info is-light">{{ $t('Total Count') }}</b-tag>
						<b-tag size="is-medium" type="is-light">{{ total }}</b-tag>
					</b-taglist>
				</div>

				<b-taglist v-if="checkedCount" attached>
					<b-tag size="is-medium" type="is-info is-light">{{ $t('Items Selected') }}</b-tag>
					<b-tag size="is-medium" type="is-light">{{ checkedCount }}</b-tag>
				</b-taglist>
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

		isDisabledPrecheckedRows: {
			type: Boolean,
			default: false,
		},

		isDisabledUnprecheckedRows: {
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

		searchPhrase: {
			type: String,
			default: "",
		},

		customPerPage: {
			type: Number,
			default: null,
		},

		hasClickableRows: {
			type: Boolean,
			default: true,
		},

		noDataMessage: {
			type: String,
			default: "No data",
		},

		showTableHeader: {
			type: Boolean,
			default: true,
		},

		isSearchVisible: {
			type: Boolean,
			default: true,
		},

		searchFields: {
			type: Array,
			default: () => [],
		},

		defaultSearchField: {
			type: Object,
			default: () => ({}),
		},

		wrapperClasses: {
			type: Array,
			default: () => [],
		},
	},

	data() {
		return {
			options: {
				perPageNumbers: [10, 20, 50, 100],
			},
			checkedCount: 0,
		};
	},

	computed: {
		...mapState(["perPage"]),
	},

	mounted() {
		this.addWrapperClasses();
	},

	methods: {
		...mapActions(["storePerPage"]),

		onClick(row, column) {
			if (column.field !== "actions") {
				this.$emit("clicked", row);
			}
		},

		checkboxChecked(rows) {
			if (this.isDisabledPrecheckedRows) {
				const immediatelyCheckedRows = this.checkedRows.map((row) => row.id);
				const checkedNewRows = rows.filter((row) => !immediatelyCheckedRows.includes(row.id));

				this.checkedCount = checkedNewRows?.length ?? 0;
				this.$emit("checked", checkedNewRows);
			} else {
				this.checkedCount = rows?.length ?? 0;
				this.$emit("checked", rows);
			}
		},

		isRowCheckable(row) {
			if (row.removed) return false;

			const precheckedRows = this.checkedRows.map((checkedRow) => checkedRow?.id);
			const isRowPrechecked = precheckedRows.includes(row.id);

			return !(this.isDisabledUnprecheckedRows
				|| (isRowPrechecked && this.isDisabledPrecheckedRows));
		},

		onChangePerPage(value) {
			this.storePerPage(value);
			this.$emit("pageChanged");
		},

		onResetSearch() {
			this.$refs.search.clearSearch();
		},

		searchValue() {
			return this.$refs.search.value;
		},

		addWrapperClasses() {
			this.wrapperClasses.forEach((value) => {
				this.$refs.table.tableWrapperClasses[value] = true;
			});
		},

		onResetSort() {
			this.$emit("resetSort");
			this.$refs.table.resetMultiSorting();
			this.$refs.table.initSort();
		},

		onSearch(event) {
			if (this.backendSearching) {
				this.$emit("onSearch", event);
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

<style lang="scss">
.level-left {
	display: flex;
	flex-wrap: wrap;
	flex-shrink: unset;
	gap: 0.75rem;

	& > .level-item {
		margin-bottom: 0;
	}
}
</style>
