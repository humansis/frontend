<template>
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
					entity="Country"
					:id="props.row.id"
					@submitted="remove"
				/>
			</div>
		</b-table-column>

	</Table>
</template>

<script>
import Table from "@/components/DataGrid/Table";
import ActionButton from "@/components/ActionButton";
import CountriesService from "@/services/CountriesService";
import { generateColumns } from "@/utils/datagrid";
import SafeDelete from "@/components/SafeDelete";
import ColumnField from "@/components/DataGrid/ColumnField";
import { Toast } from "@/utils/UI";

export default {
	name: "CountriesList",

	components: {
		SafeDelete,
		Table,
		ActionButton,
		ColumnField,
	},

	data() {
		return {
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{
						key: "name",
					},
					{
						key: "iso3",
					},
					{
						key: "availableCurrencies",
					},
					{
						type: "flag",
						key: "countryFlag",
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

			await CountriesService.getListOfCountries(
				this.table.currentPage,
				this.table.perPage,
				"desc",
			).then((response) => {
				this.table.data = response.data;
				this.table.total = response.totalCount;
				this.table.columns = generateColumns(
					this.table.visibleColumns,
				);
			}).catch((e) => {
				Toast(`(Countries) ${e}`, "is-danger");
			});

			this.$store.commit("loading", false);
		},

		showDetailWithId(id) {
			const country = this.table.data.find((item) => item.id === id);
			this.showDetail(country);
		},

		showDetail(country) {
			this.$emit("onShowDetail", country);
		},

		remove(id) {
			this.$emit("onRemove", id);
		},

		showEdit(id) {
			const country = this.table.data.find((item) => item.id === id);
			this.$emit("onShowEdit", country);
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
