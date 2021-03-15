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
								@search="$emit('search', $event)"
							/>
						</div>
					</slot>
					<slot name="filterButton" />
					<slot name="export" />
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
