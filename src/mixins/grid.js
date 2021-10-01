import { mapActions, mapState } from "vuex";

export default {
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
			this.table.currentPage = currentPage;
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

		resetSort() {
			if (this.table.sortColumn !== "" || this.table.sortDirection !== "") {
				this.table.sortColumn = "";
				this.table.sortDirection = "";
				this.fetchData();
			}
		},

		reload() {
			this.show = false;
			this.show = true;
		},
	},
};
