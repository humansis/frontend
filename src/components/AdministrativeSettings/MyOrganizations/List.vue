<template>
	<DataGrid
		v-model:items-per-page="perPage"
		:headers="table.columns"
		:items="table.data"
		:total-count="table.total"
		:loading="isLoadingList"
		@perPageChanged="onPerPageChange"
		@pageChanged="onPageChange"
		@rowClicked="(row) => onShowDetail(row.item)"
	>
		<template v-slot:actions="{ row }">
			<ButtonAction
				icon="search"
				tooltip-text="Show Detail"
				@actionConfirmed="onShowDetail(row)"
			/>

			<ButtonAction
				icon="edit"
				tooltip-text="Edit"
				@actionConfirmed="onShowEdit(row)"
			/>

			<ButtonAction
				icon="print"
				tooltip-text="Print"
				@actionConfirmed="onPrint(row.id)"
			/>
		</template>
	</DataGrid>
</template>

<script>
import MyOrganizationsService from "@/services/MyOrganizationsService";
import ButtonAction from "@/components/ButtonAction";
import DataGrid from "@/components/DataGrid";
import grid from "@/mixins/grid";
import { generateColumns } from "@/utils/datagrid";
import { Notification } from "@/utils/UI";

export default {
	name: "MyOrganizationsList",

	components: {
		DataGrid,
		ButtonAction,
	},

	mixins: [grid],

	data() {
		return {
			table: {
				data: [],
				columns: generateColumns([
					{ key: "name", title: "Organization Name", sortable: false },
					{ key: "logo", type: "image", title: "Organization Logo", sortable: false },
					{ key: "font", type: "font", title: "Font to Apply to The PDF", sortable: false },
					{ key: "primaryColor", type: "color", title: "Organization Primary Color", sortable: false },
					{ key: "secondaryColor", type: "color", title: "Organization Secondary Color", sortable: false },
					{ key: "footerContent", title: "PDF Footer Content", sortable: false },
					{ key: "actions", value: "actions", sortable: false },
				]),
				total: 0,
				currentPage: 1,
				sortDirection: "",
				sortColumn: "",
			},
		};
	},

	created() {
		this.fetchData();
	},

	methods: {
		async fetchData() {
			this.isLoadingList = true;

			await MyOrganizationsService.getListOfMyOrganizations()
				.then((response) => {
					this.table.data = response.data;
					this.table.total = response.totalCount;
				}).catch((e) => {
					Notification(`${this.$t("Organizations")} ${e.message || e}`, "error");
				});

			this.isLoadingList = false;
		},

		onPrint(id) {
			this.$emit("print", id);
		},
	},
};
</script>
