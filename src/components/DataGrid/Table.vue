<template>
	<div>
		<b-table
			striped
			hoverable
			scrollable
			narrowed
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
			@cellclick="onClick"
			@page-change="$emit('pageChanged', $event)"
			@sort="$emit('sorted', $event)"
		>
			<slot />
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
	},

	data() {
		return {
			checkedRows: [],
		};
	},

	methods: {
		onClick(row, column) {
			if (column.$options.propsData.label !== "Actions") {
				this.$emit("clicked", row);
			}
		},
	},
};
</script>
