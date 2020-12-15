<!-- TODO edit after real api-->
<template>
	<div>
		<div class="columns">
			<Search class="column is-two-fifths" @search="onSearch" />
		</div>
		<Table
			:data="table.data"
			:total="table.total"
			:current-page="table.currentPage"
			:per-page="table.perPage"
			:is-loading="isLoadingList"
			@clicked="showDetail"
			@pageChanged="onPageChange"
			@sorted="onSort"
		>
			<template v-for="column in table.columns">
				<b-table-column v-bind="column" sortable :key="column.id">
					<template v-slot="props">
						{{ props.row[column.field] }}
					</template>
				</b-table-column>
			</template>
			<b-table-column
				v-slot="props"
				label="Actions"
				centered
			>
				<div class="block">
					<ActionButton
						icon="search"
						type="is-info"
						@click.native="showDetailWithId(props.row.id)"
					/>
					<ActionButton
						icon="edit"
						type="is-link"
						@click.native="showEdit(props.row.id)"
					/>
				</div>
			</b-table-column>
		</Table>
	</div>
</template>

<script>
import Table from "@/components/DataGrid/Table";
import ActionButton from "@/components/ActionButton";
import { generateColumns } from "@/utils/datagrid";
import OrganizationServicesService from "@/services/OrganizationServicesService";
import { Toast } from "@/utils/UI";
import Search from "@/components/Search";
import grid from "@/mixins/grid";

export default {
	name: "OrganizationServicesList",

	components: {
		Search,
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
					{ key: "country" },
					{ key: "enabled" },
				],
				total: 0,
				currentPage: 1,
				perPage: 15,
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

			await OrganizationServicesService.getListOfOrganizationServices(
				this.table.currentPage,
				this.table.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.table.searchPhrase,
			).then((response) => {
				this.table.data = this.prepareDataForTable(response.data);
				this.table.total = response.totalCount;
				this.table.columns = generateColumns(
					this.table.visibleColumns,
				);
			}).catch((e) => {
				Toast(`(Organizations) ${e}`, "is-danger");
			});

			this.isLoadingList = true;
		},

		prepareDataForTable(data) {
			const preparedData = [];
			data.forEach((value) => {
				const formModel = this.mapToFormModel(value);
				preparedData.push(formModel);
			});
			return preparedData;
		},

		showDetailWithId(id) {
			const organizationService = this.table.data.find((item) => item.id === id);
			this.showDetail(organizationService);
		},

		showDetail(organizationService) {
			this.$emit("onShowDetail", organizationService);
		},

		showEdit(id) {
			const organizationService = this.table.data.find((item) => item.id === id);
			this.$emit("onShowEdit", organizationService);
		},

		mapToFormModel(
			{
				id,
				enabled,
				parametersValue,
				service,
			},
		) {
			return {
				...this.organizationServiceModel,
				id,
				enabled,
				password: parametersValue.password,
				username: parametersValue.username,
				token: parametersValue.token,
				email: parametersValue.email,
				production: parametersValue.production,
				country: service.country,
				name: service.name,
			};
		},
	},
};
</script>
