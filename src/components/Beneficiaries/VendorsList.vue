<template>
	<div>
		<Table
			has-reset-sort
			has-search
			:key="resetSortKey"
			:data="table.data"
			:total="table.total"
			:current-page="table.currentPage"
			:is-loading="isLoadingList"
			@clicked="showDetail"
			@pageChanged="onPageChange"
			@sorted="onSort"
			@changePerPage="onChangePerPage"
			@resetSort="resetSort"
			@search="onSearch"
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
				width="190"
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
import Table from "@/components/DataGrid/Table";
import SafeDelete from "@/components/SafeDelete";
import ActionButton from "@/components/ActionButton";
import VendorsService from "@/services/VendorsService";
import LocationsService from "@/services/LocationsService";
import { generateColumns } from "@/utils/datagrid";
import { Notification } from "@/utils/UI";
import grid from "@/mixins/grid";

export default {
	name: "VendorsList",

	components: {
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
				this.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.table.searchPhrase,
			).then(async ({ data, totalCount }) => {
				this.table.total = totalCount;
				this.table.data = await this.prepareDataForTable(data);
			}).catch((e) => {
				Notification(`Vendors ${e}`, "is-danger");
			});
			this.isLoadingList = false;
		},

		async prepareDataForTable(data) {
			const locations = await this.getLocations(data);

			const filledData = [];
			const promise = await data.map(async (item, key) => {
				filledData[key] = item;
				filledData[key].location = this.prepareLocations(item.locationId, locations);
			});

			await Promise.all(promise);

			return filledData;
		},

		prepareLocations(id, locations) {
			if (!locations?.length) return "";
			const foundLocation = locations.find((location) => location.id === id);
			return foundLocation ? foundLocation.adm.name : "";
		},

		async getLocations(vendors) {
			if (!vendors?.length) return [];
			return LocationsService.getLocations(vendors, "locationId")
				.then(({ data }) => data).catch((e) => {
					Notification(`Locations ${e}`, "is-danger");
				});
		},
	},
};
</script>
