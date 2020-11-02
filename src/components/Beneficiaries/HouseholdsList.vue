<template>
	<div>
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
			:filtersOptions="filtersOptions"
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
				<b-table-column :key="column.id" v-bind="column">
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
import { generateColumnsFromData, normalizeText } from "@/utils/datagrid";
import BeneficiariesService from "@/services/BeneficiariesService";
import Table from "@/components/Table";
import ActionButton from "@/components/ActionButton";
import HouseholdsFilters from "@/components/Beneficiaries/HouseholdsFilters";

export default {
	name: "HouseholdsList",

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
				visibleColumns: [],
				total: 0,
				currentPage: 1,
				perPage: 15,
			},
			filtersOptions: {
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
			try {
				this.fetch.error = null;
				const loadingComponent = this.$buefy.loading.open();

				await BeneficiariesService.getListOfHouseholds(
					this.table.currentPage,
					this.table.perPage,
					"desc",
				).then((response) => {
					this.table.data = response.data;
					this.table.total = response.totalCount;
					this.table.columns = generateColumnsFromData(
						response.data,
						this.table.visibleColumns,
					);
				});

				loadingComponent.close();
			} catch (error) {
				this.handleError(error);
			}
		},

		handleError(error) {
			console.error(error);
			this.fetch.loading = false;
			this.fetch.error = error.toString();
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

		onFiltersChange() {
			// TODO on filters change
		},
	},
};
</script>
