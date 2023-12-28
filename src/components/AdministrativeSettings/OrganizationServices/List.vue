<template>
	<DataGrid
		v-model:items-per-page="perPage"
		:headers="table.columns"
		:items="table.data"
		:total-count="table.total"
		:loading="isLoadingList"
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
		</template>
	</DataGrid>
</template>

<script>
import OrganizationServiceService from "@/services/OrganizationServiceService";
import ButtonAction from "@/components/ButtonAction";
import DataGrid from "@/components/DataGrid";
import grid from "@/mixins/grid";
import { generateColumns } from "@/utils/datagrid";
import { Notification } from "@/utils/UI";

export default {
	name: "OrganizationServicesList",

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
					{ key: "name", title: "Service Name", sortable: false },
					{ key: "iso3", title: "Country", type: "textOrNone", sortable: false },
					{ key: "enabled", sortable: false },
					{ key: "actions", value: "actions", sortable: false },
				]),
				total: 0,
				currentPage: 1,
			},
		};
	},

	created() {
		this.fetchData();
	},

	methods: {
		async fetchData() {
			this.isLoadingList = true;

			await OrganizationServiceService.getListOfOrganizationServices()
				.then(({ data, totalCount }) => {
					this.table.data = data;
					this.table.total = totalCount;
				}).catch((e) => {
					Notification(`${this.$t("Organizations")} ${e.message || e}`, "error");
				});

			this.isLoadingList = false;
		},
	},
};
</script>
