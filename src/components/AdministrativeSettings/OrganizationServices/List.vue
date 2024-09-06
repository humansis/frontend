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
				:required-permissions="PERMISSIONS.ADMINISTRATIVE_SETTING_ORGANIZATION_SERVICES"
				icon="search"
				tooltip-text="Show Detail"
				@actionConfirmed="onShowDetail(row)"
			/>

			<ButtonAction
				:required-permissions="PERMISSIONS.ADMINISTRATIVE_SETTING_ORGANIZATION_SERVICES"
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
import permissions from "@/mixins/permissions";
import { generateColumns } from "@/utils/datagrid";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";

export default {
	name: "OrganizationServicesList",

	components: {
		DataGrid,
		ButtonAction,
	},

	mixins: [grid, permissions],

	data() {
		return {
			isLoadingList: false,
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
			try {
				this.isLoadingList = true;

				const {
					data: { data, totalCount },
					status,
					message,
				} = await OrganizationServiceService.getListOfOrganizationServices();

				checkResponseStatus(status, message);

				this.table.data = data;
				this.table.total = totalCount;
			} catch (e) {
				Notification(`${this.$t("Organizations")}: ${e.message || e}`, "error");
			} finally {
				this.isLoadingList = false;
			}
		},
	},
};
</script>
