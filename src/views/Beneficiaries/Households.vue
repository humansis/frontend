<template>
	<div>
		<h2 class="title">Households</h2>
		<b-dropdown>
			<b-button
				class="mb-5"
				size="is-medium"
				type="is-danger"
				icon-left="plus"
				slot="trigger"
			>
				<span>Create</span>
			</b-button>
			<b-dropdown-item
				:value="false"
				@click="goToImportPage"
			>
				<div class="media">
					<b-icon class="media-left" icon="upload" />
					<div class="media-content">
						<h2>Import</h2>
						<small>Import from file</small>
					</div>
				</div>
			</b-dropdown-item>
			<b-dropdown-item
				:value="false"
				@click="goToCreatePage"
			>
				<div class="media">
					<b-icon class="media-left" icon="user-plus" />
					<div class="media-content">
						<h2>Add Beneficiary</h2>
						<small>Create household form</small>
					</div>
				</div>
			</b-dropdown-item>
		</b-dropdown>

		<ExportButton
			type="is-success"
			size="is-default"
			class="is-pulled-right"
			:formats="{ xlsx: true, csv: true, ods: true}"
			@exportData="exportHousehold"
		/>

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
			@filtersChanged="onFiltersChange"
		/>

		<Table
			ref="householdList"
			:data="table.data"
			:total="table.total"
			:current-page="table.currentPage"
			:per-page="table.perPage"
			:checkable="true"
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
import { Toast } from "@/utils/UI";
import { generateColumns, normalizeText } from "@/utils/datagrid";
import BeneficiariesService from "@/services/BeneficiariesService";
import Table from "@/components/DataGrid/Table";
import ActionButton from "@/components/ActionButton";
import HouseholdsFilters from "@/components/Beneficiaries/HouseholdsFilters";
import ExportButton from "@/components/ExportButton";

export default {
	name: "Households",

	components: {
		ExportButton,
		Table,
		ActionButton,
		HouseholdsFilters,
	},

	data() {
		return {
			advancedSearchVisible: false,
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{
						key: "id",
						label: "Household ID",
					},
					{
						key: "contactFamilyName",
						label: "Family Name",
					},
					{
						key: "contactGivenName",
						label: "First Name",
					},
					{
						key: "members",
					},
					{
						key: "vulnerabilities",
					},
					{
						key: "idNumber",
						label: "ID Number",
					},
					{
						key: "projects",
					},
					{
						key: "location",
						label: "Current Location",
					},
				],
				total: 0,
				currentPage: 1,
				perPage: 15,
			},
			checkedRows: [],
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

		goToImportPage() {
			this.$router.push({ name: "ImportHousehold" });
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

		exportHousehold(format) {
			console.log(format);
			console.log(this.$refs.householdList.checkedRows);
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
