export default {
	data() {
		return {
			isLoadingList: false,
		};
	},

	methods: {
		onPageChange(currentPage) {
			this.table.currentPage = currentPage;
			this.fetchData();
		},

		onSort(column) {
			if (this.table.sortColumn === column) {
				this.table.sortDirection = this.table.sortDirection === "asc" ? "desc" : "asc";
			} else {
				this.table.sortColumn = column;
				this.table.sortDirection = "desc";
			}
			this.fetchData();
		},

		onSearch(value) {
			this.searchPhrase = value;
			this.fetchData();
		},
	},
};
