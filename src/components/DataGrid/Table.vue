<template>
	<div>
		<b-table
			pagination-position="bottom"
			default-sort-direction="asc"
			sort-icon="arrow-up"
			sort-icon-size="is-small"
			paginated
			striped
			hoverable
			backend-pagination
			default-sort="id"
			aria-next-label="Next page"
			aria-previous-label="Previous page"
			aria-page-label="Page"
			aria-current-label="Current page"
			selectable
			:checkable="checkable"
			:data="data"
			:total="total"
			:per-page="perPage"
			:current-page="currentPage"
			:pagination-simple="false"
			@dblclick="$emit('clicked', $event)"
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
		checkable: {
			type: Boolean,
			default: false,
		},
	},
};
</script>
