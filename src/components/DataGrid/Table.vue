<template>
	<div>
		<b-table
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
			:per-page="perPage"
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
					v-model="perPageNumber"
					hide-selected
					deselect-label=""
					select-label=""
					selected-label=""
					:options="options.perPageNumbers"
					:allow-empty="false"
					@input="changePerPage"
				/>
			</template>
		</b-table>
	</div>
</template>

<script>
export default {
	name: "Table",

	props: {
		data: Array,
		total: Number,
		currentPage: Number,
		perPage: Number,
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
	},

	data() {
		return {
			checkedRows: [],
			perPageNumber: this.perPage,
			options: {
				perPageNumbers: [5, 10, 15],
			},
		};
	},

	methods: {
		onClick(row, column) {
			if (column.$options.propsData.label !== "Actions") {
				this.$emit("clicked", row);
			}
		},

		changePerPage() {
			this.$emit("changePerPage", this.perPageNumber);
		},
	},
};
</script>
