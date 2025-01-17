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
				:required-permissions="PERMISSIONS.ADMINISTRATIVE_SETTING_ORGANIZATION"
				icon="search"
				tooltip-text="Show Detail"
				@actionConfirmed="onShowDetail(row)"
			/>

			<ButtonAction
				:required-permissions="PERMISSIONS.ADMINISTRATIVE_SETTING_ORGANIZATION"
				icon="edit"
				tooltip-text="Edit"
				@actionConfirmed="onShowEdit(row)"
			/>

			<ButtonAction
				:required-permissions="PERMISSIONS.ADMINISTRATIVE_SETTING_ORGANIZATION"
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
import permissions from "@/mixins/permissions";
import { generateColumns } from "@/utils/datagrid";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";

export default {
	name: "MyOrganizationsList",

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
			try {
				this.isLoadingList = true;

				const {
					data: { data, totalCount },
					status,
					message,
				} = await MyOrganizationsService.getListOfMyOrganizations();

				checkResponseStatus(status, message);

				this.table.data = data;
				this.table.total = totalCount;
			} catch (e) {
				Notification(`${this.$t("Organizations")}: ${e.message || e}`, "error");
			} finally {
				this.isLoadingList = false;
			}
		},

		onPrint(id) {
			this.$emit("print", id);
		},
	},
};
</script>
