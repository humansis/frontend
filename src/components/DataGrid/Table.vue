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

export default {
	name: "Table",

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
	},
};
</script>
