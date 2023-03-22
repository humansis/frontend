import { mapActions, mapState } from "vuex";
import urlFiltersHelper from "@/mixins/urlFiltersHelper";

export default {
	mixins: [urlFiltersHelper],

	data() {
		return {
			show: true,
			isLoadingList: false,
		};
	},

	computed: {
		...mapState(["perPage"]),
	},

	methods: {
		...mapActions(["storePerPage"]),

		onPageChange(currentPage) {
			this.table.currentPage = currentPage || 1;
			this.fetchData();
		},

		onSort(column) {
			const currentColumn = this.table.visibleColumns.find(({ key }) => key === column);
			const sortKey = currentColumn.sortKey || column;

			if (this.table.sortColumn === sortKey) {
				this.table.sortDirection = this.table.sortDirection === "asc" ? "desc" : "asc";
			} else {
				this.table.sortColumn = sortKey;
				this.table.sortDirection = "desc";
			}

			this.fetchData();
		},

		onSearch(value) {
			this.table.searchPhrase = value;
			this.table.currentPage = 1;
			this.fetchData();
		},

		onChangePerPage() {
			this.fetchData();
		},

		removeFromList(id) {
			const entity = this.table.data.find((item) => item.id === id);
			const index = this.table.data.indexOf(entity);
			this.table.data.splice(index, 1);
		},

		assistanceMove(id) {
			const entity = this.table.data.find((item) => item.id === id);
			this.$emit("onShowMove", entity);
		},

		showDetailWithId(id) {
			const entity = this.table.data.find((item) => item.id === id);
			this.showDetail(entity);
		},

		showDetail(entity) {
			this.$emit("onShowDetail", entity);
		},

		showEdit(id) {
			const entity = this.table.data.find((item) => item.id === id);
			this.$emit("onShowEdit", entity);
		},

		remove(id) {
			this.$emit("onRemove", id);
		},

		resetSort(sortColumn = "", sortDirection = "") {
			if (this.table.sortColumn !== "" || this.table.sortDirection !== "") {
				this.table.sortColumn = sortColumn;
				this.table.sortDirection = sortDirection;
				this.fetchData();
			}
		},

		resetSearch({ tableRef, filtersRef }) {
			const searchValue = this.$refs[tableRef].searchValue();

			if (Object.keys(this.filters).length) {
				this.filters = {};
				this.$refs[filtersRef].resetFilters();
			}

			if (searchValue) {
				this.$refs[tableRef].onResetSearch();
			} else {
				this.fetchData();
			}
		},

		reload() {
			this.show = false;
			this.show = true;
		},
	},
};
