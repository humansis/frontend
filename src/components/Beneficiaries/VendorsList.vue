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
			@changePerPage="onChangePerPage"
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
				width="180"
				centered
			>
				<div class="block">
					<ActionButton
						icon="search"
						type="is-link"
						tooltip="Show Detail"
						@click.native="showDetailWithId(props.row.id)"
					/>
					<ActionButton
						icon="edit"
						type="is-link"
						tooltip="Edit"
						@click.native="showEdit(props.row.id)"
					/>
					<SafeDelete
						icon="trash"
						entity="Vendor"
						tooltip="Delete"
						:id="props.row.id"
						@submitted="remove"
					/>
					<ActionButton icon="print" type="is-dark" tooltip="Print" />
				</div>
			</b-table-column>
		</Table>
	</div>
</template>

<script>
import { generateColumns } from "@/utils/datagrid";
import Table from "@/components/DataGrid/Table";
import ActionButton from "@/components/ActionButton";
import SafeDelete from "@/components/SafeDelete";
import VendorsService from "@/services/VendorsService";
import LocationsService from "@/services/LocationsService";
import { Notification } from "@/utils/UI";
import Search from "@/components/Search";
import grid from "@/mixins/grid";

export default {
	name: "VendorsList",

	components: {
		Search,
		SafeDelete,
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
					{ key: "username" },
					{ key: "name" },
					{ key: "addressNumber" },
					{ key: "addressPostcode" },
					{ key: "addressStreet" },
					{ key: "location" },
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

			this.table.columns = generateColumns(this.table.visibleColumns);
			await VendorsService.getListOfVendors(
				this.table.currentPage,
				this.table.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.table.searchPhrase,
			).then((response) => {
				this.buildLocationsForVendors(response.data).then((result) => {
					this.table.data = result;
					this.table.total = response.totalCount;
				});
			}).catch((e) => {
				Notification(`Vendors ${e}`, "is-danger");
			});
			// TODO Edit - Loading closes after loads data and must wait for locations
			this.isLoadingList = false;
		},

		async buildLocationsForVendors(data) {
			// TODO fix after implement Location endpoint
			const preparedVendors = [];

			data.forEach((vendor) => {
				const preparedVendor = vendor;
				if (vendor.adm4Id) {
					LocationsService.getDetailOfAdm4(vendor.adm4Id)
						.then((response) => {
							preparedVendor.location = response.data.name;
							preparedVendors.push(preparedVendor);
						}).catch((e) => {
							Notification(`Adm4 ${e}`, "is-danger");
						});
				} else if (vendor.adm3Id) {
					LocationsService.getDetailOfAdm3(vendor.adm3Id)
						.then((response) => {
							preparedVendor.location = response.data.name;
							preparedVendors.push(preparedVendor);
						}).catch((e) => {
							Notification(`Adm3 ${e}`, "is-danger");
						});
				} else if (vendor.adm2Id) {
					LocationsService.getDetailOfAdm2(vendor.adm2Id)
						.then((response) => {
							preparedVendor.location = response.data.name;
							preparedVendors.push(preparedVendor);
						}).catch((e) => {
							Notification(`Adm2 ${e}`, "is-danger");
						});
				} else if (vendor.adm1Id) {
					LocationsService.getDetailOfAdm1(vendor.adm1Id)
						.then((response) => {
							preparedVendor.location = response.data.name;
							preparedVendors.push(preparedVendor);
						}).catch((e) => {
							Notification(`Adm1 ${e}`, "is-danger");
						});
				}
			});
			return preparedVendors;
		},
	},
};
</script>
