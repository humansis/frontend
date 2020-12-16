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

		removeFromList(id) {
			const entity = this.table.data.find((item) => item.id === id);
			const index = this.table.data.indexOf(entity);
			this.table.data.splice(index, 1);
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
	},
};
