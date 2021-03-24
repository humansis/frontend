<template>
	<CardComponent class="has-table" :title="title">
		<slot name="progress">
			<b-progress	:value="100" format="percent" />
		</slot>

		<slot name="tableHeader">
			<div class="level p-4 has-border-bottom">
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
							Reset Sort
						</b-button>
					</div>
				</slot>
			</div>
		</slot>

		<slot name="filter" />

		<b-table
			ref="table"
			striped
			hoverable
			scrollable
			:backend-sorting="backendSorting"
			:backend-pagination="backendPagination"
			selectable
			pagination-position="bottom"
			default-sort-direction="asc"
			sort-icon="arrow-up"
			sort-icon-size="is-small"
			default-sort="id"
			aria-next-label="Next page"
			aria-previous-label="Previous page"
			aria-page-label="Page"
			aria-current-label="Current page"
			:checked-rows.sync="checkedRows"
			:paginated="paginated"
			:checkable="checkable"
			:data="preparedData"
			:total="total"
			:per-page="customPerPage || perPage"
			:current-page="currentPage"
			:pagination-simple="false"
			:loading="isLoading"
			@check="checkboxChecked"
			@cellclick="onClick"
			@page-change="$emit('pageChanged', $event)"
			@sort="$emit('sorted', $event)"
		>
			<slot />

			<template v-if="paginated" #bottom-left>
				<p style="width: 120px;">Per Page: </p>
				<MultiSelect
					hide-selected
					open-direction="above"
					:value="perPage"
					:options="options.perPageNumbers"
					:allow-empty="false"
					:show-labels="false"
					@input="onChangePerPage"
				/>
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
			checkedRows: [],
			options: {
				perPageNumbers: [5, 10, 15],
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
		...mapActions(["changePerPage"]),

		onClick(row, column) {
			if (column.$options.propsData.label !== "Actions") {
				this.$emit("clicked", row);
			}
		},

		checkboxChecked(rows) {
			this.$emit("checked", rows);
		},

		onChangePerPage(value) {
			this.changePerPage(value);
			this.$emit("changePerPage");
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
