import { mapActions, mapState } from "vuex";
import urlFiltersHelper from "@/mixins/urlFiltersHelper";

export default {
	mixins: [urlFiltersHelper],

	emits: [
		"showMove",
		"showDetail",
		"showDetail",
		"showEdit",
		"onDelete",
		"download",
		"statusChange",
	],

	data() {
		return {
			show: true,
			sortValue: [],
		};
	},

	mounted() {
		if (this.table?.sortColumn && this.table?.sortDirection) {
			this.sortValue = [{
				key: this.table.sortColumn?.key || this.table.sortColumn,
				order: this.table.sortDirection,
			}];
		}
	},

	watch: {
		table: {
			deep: true,
			handler(value) {
				this.sortValue = [{
					key: value.sortColumn?.key || value.sortColumn,
					order: value.sortDirection,
				}];
			},
		},
	},

	computed: {
		...mapState(["perPage"]),
	},

	methods: {
		...mapActions(["storePerPage"]),

		onPerPageChange({ currentPerPage, currentPage }) {
			this.storePerPage(currentPerPage);

			if (currentPage) {
				this.table.currentPage = currentPage;
			}

			this.fetchData();
		},

		onPageChange(currentPage) {
			this.table.currentPage = currentPage || 1;

			if (this.selectedRows) {
				this.selectedRows = 0;
			}

			this.fetchData();
		},

		onSort(sortData) {
			let sort = null;

			if (sortData.length) {
				sort = sortData;
			} else {
				sort = [{
					key: this.table.sortColumn.key || this.table.sortColumn,
					order: this.table.sortDirection === "asc"
						? "desc"
						: "asc",
				}];
			}

			const currentColumn = this.table.columns.find(({ key }) => key === sort[0].key);
			const sortKey = currentColumn.sortKey || sort[0].key;

			this.table.sortColumn = { key: currentColumn.key, sortKey };
			this.table.sortDirection = sort[0].order;

			this.fetchData();
		},

		onResetSort({ key, order }) {
			if (this.table.sortColumn !== "" && this.table.sortDirection !== "") {
				this.table.sortColumn = key;
				this.table.sortDirection = order;

				this.fetchData();
			}
		},

		onSearch(value) {
			this.table.searchPhrase = value;
			this.table.currentPage = 1;
			this.fetchData();
		},

		removeFromList(id) {
			const entity = this.table.data.find((item) => item.id === id);
			const index = this.table.data.indexOf(entity);
			this.table.data.splice(index, 1);
			this.table.total -= 1;
		},

		onAssistanceMove(id) {
			const entity = this.table.data.find((item) => item.id === id);
			this.$emit("showMove", entity);
		},

		showDetailWithId(id) {
			const entity = this.table.data.find((item) => item.id === id);
			this.showDetail(entity);
		},

		onShowDetail(id) {
			this.$emit("showDetail", id);
		},

		onShowEdit(row) {
			this.$emit("showEdit", row);
		},

		onRemove(id) {
			this.$emit("delete", id);
		},

		onDownload(scoring) {
			this.$emit("download", scoring);
		},

		onStatusChange(id, enabled) {
			this.$emit("statusChange", { id, enabled });
		},

		resetSearch({ tableRef, filtersRef, bulkSearchRef }, isFetchEnabled = true) {
			const searchValue = this.$refs[tableRef].searchValue() || this.$refs[tableRef].searchPhrase;

			if (filtersRef && this.$refs[filtersRef] && Object.keys(this.filters).length) {
				this.filters = {};
				this.$refs[filtersRef].resetFilters();
			}

			if (bulkSearchRef && this.$refs[bulkSearchRef]) {
				this.bulkSearch = {};
				this.$refs[bulkSearchRef].resetFilters();
			}

			if (isFetchEnabled) {
				if (searchValue.length) {
					this.$refs[tableRef].resetSearch();
				} else {
					this.fetchData();
				}
			}
		},

		reload() {
			this.show = false;
			this.show = true;
		},
	},
};
