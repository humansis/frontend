<template>
	<Table
		has-search
		:data="table.data"
		:total="table.total"
		:current-page="table.currentPage"
		:is-loading="isLoadingList"
		:backend-searching="false"
		:backend-sorting="false"
		:backend-pagination="false"
		:columns="table.visibleColumns"
		@clicked="showDetail"
	>
		<template v-for="column in table.columns">
			<b-table-column
				v-bind="column"
				v-slot="props"
				sortable
				:key="column.id"
			>
				<ColumnField :column="column" :data="props" />
			</b-table-column>
		</template>
		<b-table-column
			v-slot="props"
			:label="$t('Actions')"
			width="100"
			centered
		>
			<div class="buttons is-right">
				<ActionButton
					icon="search"
					type="is-primary"
					:tooltip="$t('Show Detail')"
					@click.native="showDetailWithId(props.row.id)"
				/>
				<ActionButton
					icon="edit"
					:tooltip="$t('Edit')"
					@click.native="showEdit(props.row.id)"
				/>
			</div>
		</b-table-column>
	</Table>
</template>

<script>
import ActionButton from "@/components/ActionButton";
import Table from "@/components/DataGrid/Table";
import ColumnField from "@/components/DataGrid/ColumnField";
import OrganizationServiceService from "@/services/OrganizationServiceService";
import { generateColumns } from "@/utils/datagrid";
import { Notification } from "@/utils/UI";
import grid from "@/mixins/grid";

export default {
	name: "OrganizationServiceList",

	components: {
		ColumnField,
		Table,
		ActionButton,
	},

	mixins: [grid],

	data() {
		return {
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{ key: "name", label: "Service Name", searchable: true },
					{ key: "iso3", label: "Country", type: "textOrNone", searchable: true },
					{ key: "enabled", searchable: true },
				],
				total: 0,
				currentPage: 1,
				sortDirection: "",
				sortColumn: "",
				searchPhrase: "",
			},
		};
	},

	watch: {
		$route: "fetchData",
	},

	mounted() {
		this.fetchData();
	},

	methods: {
		async fetchData() {
			this.isLoadingList = true;

			this.table.columns = generateColumns(this.table.visibleColumns);
			await OrganizationServiceService.getListOfOrganizationServices()
				.then(({ data, totalCount }) => {
					this.table.data = data;
					this.table.total = totalCount;
				}).catch((e) => {
					if (e.message) Notification(`${this.$t("Organizations")} ${e}`, "is-danger");
				});

			this.isLoadingList = false;
		},
	},
};
</script>
