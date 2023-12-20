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

		sortValue() {
			return [{
				key: this.table.sortColumn?.key || this.table.sortColumn,
				order: this.table.sortDirection,
			}];
		},
	},

	methods: {
		...mapActions(["storePerPage"]),

		perPageChange({ currentPerPage, currentPage }) {
			this.storePerPage(currentPerPage);

			if (currentPage) {
				this.table.currentPage = currentPage;
			}

			this.fetchData();
		},

		pageChange(currentPage) {
			this.table.currentPage = currentPage || 1;
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

		resetSort({ key, order }) {
			console.log(key, order);
			if (this.table.sortColumn !== "" && this.table.sortDirection !== "") {
				this.table.sortColumn = key;
				this.table.sortDirection = order;

				this.fetchData();
			}
		},

		search(value) {
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
			this.$emit("showMove", entity);
		},

		showDetailWithId(id) {
			const entity = this.table.data.find((item) => item.id === id);
			this.showDetail(entity);
		},

		showDetail(id) {
			this.$emit("showDetail", id);
		},

		showEdit(row) {
			this.$emit("showEdit", row);
		},

		remove(id) {
			this.$emit("onDelete", id);
		},

		download(scoring) {
			this.$emit("download", scoring);
		},

		statusChange(id, enabled) {
			this.$emit("statusChange", { id, enabled });
		},

		resetSearch({ tableRef, filtersRef, bulkSearchRef }) {
			const searchValue = this.$refs[tableRef].searchValue();

			if (Object.keys(this.filters).length) {
				this.filters = {};
				this.$refs[filtersRef].resetFilters();
			}

			if (bulkSearchRef) {
				this.bulkSearch = {};
				this.$refs[bulkSearchRef].resetFilters();
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
