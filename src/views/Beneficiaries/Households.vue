<template>
	<div>
		<h2 class="title">Households</h2>
		<b-button
			class="mb-5"
			size="is-medium"
			type="is-danger"
			icon-left="plus"
			@click="goToCreatePage"
		>
			Create
		</b-button>
		<div class="columns">
			<div class="column is-two-fifths">
				<b-field>
					<b-input placeholder="Search by keyword" type="search" icon="search" />
				</b-field>
			</div>
			<div class="column">
				<button
					class="button"
					slot="trigger"
					@click="filtersToggle"
				>
					<span>Advanced search</span>
					<b-icon
						size="is-small"
						:icon="advancedSearchVisible ? 'arrow-up' : 'arrow-down'"
					/>
				</button>
			</div>
		</div>

		<HouseholdsFilters
			v-if="advancedSearchVisible"
			:filtersOptions="filters"
			@filtersChanged="onFiltersChange"
		/>

		<Table
			:data="table.data"
			:total="table.total"
			:current-page="table.currentPage"
			:per-page="table.perPage"
			@clicked="goToDetail"
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
				label="Actions"
			>
				<div class="block">
					<ActionButton icon="edit" type="is-link" />
					<ActionButton icon="search" type="is-info" />
					<ActionButton icon="trash" type="is-danger" />
				</div>
			</b-table-column>

		</Table>
	</div>
</template>

<script>
import { generateColumns, normalizeText } from "@/utils/datagrid";
import BeneficiariesService from "@/services/BeneficiariesService";
import Table from "@/components/DataGrid/Table";
import ActionButton from "@/components/ActionButton";
import HouseholdsFilters from "@/components/Beneficiaries/HouseholdsFilters";
import { Toast } from "@/utils/UI";

export default {
	name: "Households",

	components: {
		Table,
		ActionButton,
		HouseholdsFilters,
	},

	data() {
		return {
			fetch: {
				error: null,
			},
			advancedSearchVisible: false,
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{
						key: "id",
						label: "Id",
					},
					{
						key: "shelterStatus",
						label: "Shelter Status",
					},
					{
						key: "notes",
						label: "Notes",
					},
					{
						key: "longitude",
						label: "Longitude",
					},
					{
						key: "latitude",
						label: "Latitude",
					},
					{
						key: "incomeLevel",
						label: "Income Level",
					},
					{
						key: "deptLevel",
						label: "Dept Level",
					},
				],
				total: 0,
				currentPage: 1,
				perPage: 15,
			},
			filters: {
				projects: [],
				vulnerabilities: [],
				gender: [],
				residencies: [],
				referrals: [],
				livelihoods: [],
				adm1: [],
				adm2: [],
				adm3: [],
				adm4: [],
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

			await BeneficiariesService.getListOfHouseholds(
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
				Toast(`(Households) ${e}`, "is-danger");
			});

			this.$store.commit("loading", false);
		},

		goToCreatePage() {
			this.$router.push({ name: "AddHousehold" });
		},

		normalizeText(text) {
			return normalizeText(text);
		},

		filtersToggle() {
			this.advancedSearchVisible = !this.advancedSearchVisible;
		},

		goToDetail() {
			// TODO go to detail
		},

		onPageChange() {
			// TODO on table page change
		},

		onSort() {
			// TODO on table sort
		},

		async onFiltersChange(selectedFilters) {
			await BeneficiariesService.getListOfHouseholds(
				this.table.currentPage,
				this.table.perPage,
				"desc",
				null,
				selectedFilters,
			).then((response) => {
				this.table.data = response.data;
				this.table.total = response.totalCount;
			}).catch((e) => {
				Toast(`(Households) ${e}`, "is-danger");
			});
		},
	},
};
</script>
