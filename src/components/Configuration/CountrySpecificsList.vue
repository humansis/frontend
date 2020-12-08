<template>
	<div>
		<div class="columns">
			<Search class="column is-two-fifths" @search="fetchData" />
			<ExportButton
				class="column"
				type="is-success"
				size="is-default"
				space-between
				:formats="{ xlsx: true, csv: true, ods: true}"
			/>
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
					<SafeDelete
						icon="trash"
						entity="Country Specifics"
						:id="props.row.id"
						@submitted="onRemove"
					/>
				</div>
			</b-table-column>

		</Table>
	</div>
</template>

<script>
import { generateColumns } from "@/utils/datagrid";
import CountrySpecificOptionsService from "@/services/CountrySpecificOptionsService";
import Table from "@/components/DataGrid/Table";
import ActionButton from "@/components/ActionButton";
import SafeDelete from "@/components/SafeDelete";
import { Toast } from "@/utils/UI";
import Search from "@/components/Search";
import ExportButton from "@/components/ExportButton";
import grid from "@/mixins/grid";

export default {
	name: "CountrySpecificsList",

	components: {
		Search,
		ExportButton,
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
					{ key: "field" },
					{ key: "type" },
					{ key: "target" },
				],
				total: 0,
				currentPage: 1,
				perPage: 15,
				sortDirection: "",
				sortColumn: "",
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
		async fetchData(value) {
			this.$store.commit("loading", true);

			await CountrySpecificOptionsService.getListOfCountrySpecificOptions(
				this.table.currentPage,
				this.table.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				value,
			).then((response) => {
				this.table.data = response.data;
				this.table.total = response.totalCount;
				this.table.columns = generateColumns(
					this.table.visibleColumns,
				);
			}).catch((e) => {
				Toast(`(Country Specific Options) ${e}`, "is-danger");
			});

			this.$store.commit("loading", false);
		},

		showDetailWithId(id) {
			const countrySpecifics = this.table.data.find((item) => item.id === id);
			this.showDetail(countrySpecifics);
		},

		showDetail(countrySpecifics) {
			this.$emit("onShowDetail", countrySpecifics);
		},

		onRemove(id) {
			this.$emit("onRemove", id);
		},
	},
};
</script>
