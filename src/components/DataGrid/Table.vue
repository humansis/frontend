<template>
	<div>
		<slot name="table-header">
			<div class="columns">
				<slot name="search">
					<Search v-if="hasSearch" class="column is-two-fifths" @search="$emit('search', $event)" />
				</slot>
				<slot name="filterButton" />
				<slot name="export" />
				<slot name="resetSort">
					<div class="column">
						<b-button
							v-if="hasResetSort"
							icon-left="eraser"
							class="is-pulled-right reset-sort-button is-small is-light mt-2"
							@click="onResetSort"
						>
							Reset Sort
						</b-button>
					</div>
				</slot>
			</div>
		</slot>
		<slot name="filter" />
		<slot name="progress" />
		<b-table
			ref="table"
			striped
			hoverable
			scrollable
			backend-sorting
			backend-pagination
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
			:data="data"
			:total="total"
			:per-page="customPerPage || perPage"
			:current-page="currentPage"
			:pagination-simple="false"
			:loading="isLoading"
			@cellclick="onClick"
			@page-change="$emit('pageChanged', $event)"
			@sort="$emit('sorted', $event)"
		>
			<slot />
			<template v-if="paginated" slot="bottom-left">
				<p style="width: 120px;">Per Page: </p>
				<MultiSelect
					hide-selected
					deselect-label=""
					select-label=""
					selected-label=""
					:value="perPage"
					:options="options.perPageNumbers"
					:allow-empty="false"
					@input="onChangePerPage"
				/>
			</template>
		</b-table>
	</div>
</template>

<script>
import { mapActions, mapState } from "vuex";
import Search from "@/components/Search";

export default {
	name: "Table",

	components: {
		Search,
	},

	props: {
		data: Array,
		total: Number,
		currentPage: Number,
		paginated: {
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
			default: 10,
		},
	},

	data() {
		return {
			checkedRows: [],
			options: {
				perPageNumbers: [5, 10, 15],
			},
		};
	},

	computed: {
		...mapState(["perPage"]),
	},

	methods: {
		...mapActions(["changePerPage"]),

		onClick(row, column) {
			if (column.$options.propsData.label !== "Actions") {
				this.$emit("clicked", row);
			}
		},

		onChangePerPage(value) {
			this.changePerPage(value);
			this.$emit("changePerPage");
		},

		onResetSort() {
			this.$refs.table.resetMultiSorting();
			this.$emit("resetSort");
		},
	},
};
</script>
