<template>
	<div>
		<div class="columns">
			<div class="column is-two-fifths">
				<b-field>
					<b-input placeholder="Search..."
						type="search"
						icon="search"
					/>
				</b-field>
			</div>
		</div>
		<Table
			:data="table.data"
			:total="table.total"
			:current-page="table.currentPage"
			:per-page="table.perPage"
			@clicked="showDetail"
			@pageChanged="onPageChange"
			@sorted="onSort"
		>
			<template v-for="column in table.columns">
				<b-table-column v-bind="column" :key="column.id">
					<template v-slot="props">
						{{ props.row[column.field] }}
					</template>
				</b-table-column>
			</template>

			<b-table-column
				v-slot="props"
				label="Actions"
			>
				<div class="block">
					<ActionButton
						icon="search"
						type="is-link"
						@click.native="showDetailWithId(props.row.id)"
					/>
					<ActionButton
						icon="edit"
						type="is-link"
						@click.native="showEdit(props.row.id)"
					/>
					<SafeDelete
						icon="trash"
						entity="Vendor"
						:id="props.row.id"
						@submitted="remove"
					/>
					<ActionButton icon="print" type="is-dark" />
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
import { Toast } from "@/utils/UI";

export default {
	name: "VendorsList",

	components: {
		SafeDelete,
		Table,
		ActionButton,
	},

	data() {
		return {
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{
						key: "username",
					},
					{
						key: "name",
					},
					{
						key: "addressNumber",
					},
					{
						key: "addressPostcode",
					},
					{
						key: "addressStreet",
					},
					{
						key: "location",
					},
				],
				total: 0,
				currentPage: 1,
				perPage: 15,
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
			this.$store.commit("loading", true);

			await VendorsService.getListOfVendors(
				this.table.currentPage,
				this.table.perPage,
				"desc",
			).then((response) => {
				this.buildLocationsForVendors(response.data).then((result) => {
					this.table.data = result;
					this.table.total = response.totalCount;
					this.table.columns = generateColumns(
						this.table.visibleColumns,
					);
				});
			}).catch((e) => {
				Toast(`(Vendors) ${e}`, "is-danger");
			});

			this.$store.commit("loading", false);
		},

		async buildLocationsForVendors(data) {
			const preparedVendors = [];

			data.forEach((vendor) => {
				const preparedVendor = vendor;
				if (vendor.adm4Id) {
					LocationsService.getDetailOfAdm4(vendor.adm4Id)
						.then((response) => {
							preparedVendor.location = response.data.name;
							preparedVendors.push(preparedVendor);
						}).catch((e) => {
							Toast(`(Adm4) ${e}`, "is-danger");
						});
				} else if (vendor.adm3Id) {
					LocationsService.getDetailOfAdm3(vendor.adm3Id)
						.then((response) => {
							preparedVendor.location = response.data.name;
							preparedVendors.push(preparedVendor);
						}).catch((e) => {
							Toast(`(Adm3) ${e}`, "is-danger");
						});
				} else if (vendor.adm2Id) {
					LocationsService.getDetailOfAdm2(vendor.adm2Id)
						.then((response) => {
							preparedVendor.location = response.data.name;
							preparedVendors.push(preparedVendor);
						}).catch((e) => {
							Toast(`(Adm2) ${e}`, "is-danger");
						});
				} else if (vendor.adm1Id) {
					LocationsService.getDetailOfAdm1(vendor.adm1Id)
						.then((response) => {
							preparedVendor.location = response.data.name;
							preparedVendors.push(preparedVendor);
						}).catch((e) => {
							Toast(`(Adm1) ${e}`, "is-danger");
						});
				}
			});
			return preparedVendors;
		},

		showEdit(id) {
			const vendor = this.table.data.find((item) => item.id === id);
			this.$emit("onShowEdit", vendor);
		},

		showDetailWithId(id) {
			const vendor = this.table.data.find((item) => item.id === id);
			this.showDetail(vendor);
		},

		showDetail(vendor) {
			this.$emit("onShowDetail", vendor);
		},

		remove(id) {
			this.$emit("onRemove", id);
		},

		onPageChange() {
			// TODO on table page change
		},

		onSort() {
			// TODO on table sort
		},
	},
};
</script>
