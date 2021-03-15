<template>
	<div>
		<Table
			has-search
			:data="table.data"
			:total="table.total"
			:current-page="table.currentPage"
			:is-loading="isLoadingList"
			@clicked="showDetail"
			@pageChanged="onPageChange"
			@changePerPage="onChangePerPage"
			@search="onSearch"
		>
			<template v-for="column in table.columns">
				<b-table-column
					v-bind="column"
					v-slot="props"
					:key="column.id"
				>
					<ColumnField :column="column" :data="props" />
				</b-table-column>
			</template>
			<b-table-column
				v-slot="props"
				label="Actions"
				centered
			>
				<div class="buttons is-right">
					<ActionButton
						icon="search"
						type="is-primary"
						tooltip="Show Detail"
						@click.native="showDetailWithId(props.row.id)"
					/>
					<ActionButton
						icon="edit"
						tooltip="Edit"
						@click.native="showEdit(props.row.id)"
					/>
				</div>
			</b-table-column>
		</Table>
	</div>
</template>

<script>
import ActionButton from "@/components/ActionButton";
import Table from "@/components/DataGrid/Table";
import ColumnField from "@/components/DataGrid/ColumnField";
import OrganizationServicesService from "@/services/OrganizationServicesService";
import { generateColumns } from "@/utils/datagrid";
import { Notification } from "@/utils/UI";
import grid from "@/mixins/grid";

export default {
	name: "OrganizationServicesList",

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
					{ key: "name", label: "Service Name" },
					{ key: "iso3", label: "Country", type: "textOrNone" },
					{ key: "enabled" },
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
			await OrganizationServicesService.getListOfOrganizationServices()
				.then(({ data, totalCount }) => {
					this.table.data = data;
					this.table.total = totalCount;
				}).catch((e) => {
					Notification(`Organizations ${e}`, "is-danger");
				});

			this.isLoadingList = false;
		},

		mapToFormModel(
			{
				id,
				enabled,
				service,
			},
		) {
			return {
				...this.organizationServiceModel,
				id,
				enabled,
				country: service.country,
				name: service.name,
			};
		},
	},
};
</script>
