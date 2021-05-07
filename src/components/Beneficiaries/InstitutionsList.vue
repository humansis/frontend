<template>
	<Table
		has-reset-sort
		has-search
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
			centered
			width="190"
			field="actions"
			:label="$t('Actions')"
		>
			<div class="buttons is-right">
				<ActionButton
					v-if="userCan.viewBeneficiary"
					icon="search"
					type="is-primary"
					:tooltip="$t('Show Detail')"
					@click="showDetailWithId(props.row.id)"
				/>
				<ActionButton
					v-if="userCan.editBeneficiary"
					icon="edit"
					:tooltip="$t('Edit')"
					@click="showEdit(props.row.id)"
				/>
				<SafeDelete
					v-if="userCan.deleteBeneficiary"
					icon="trash"
					:entity="$t('Institution')"
					:tooltip="$t('Delete')"
					:id="props.row.id"
					@submitted="remove"
				/>
			</div>
		</b-table-column>
		<template #filterButton>
			<b-button
				slot="trigger"
				:icon-right="advancedSearchVisible ? 'arrow-up' : 'arrow-down'"
				@click="filtersToggle"
			>
				{{ $t('Advanced Search') }}
			</b-button>
		</template>
		<template #filter>
			<b-collapse v-model="advancedSearchVisible">
				<InstitutionsFilter @filtersChanged="onFiltersChange" />
			</b-collapse>
		</template>
	</Table>
</template>

<script>
import Table from "@/components/DataGrid/Table";
import ActionButton from "@/components/ActionButton";
import SafeDelete from "@/components/SafeDelete";
import InstitutionService from "@/services/InstitutionService";
import { generateColumns } from "@/utils/datagrid";
import { Notification } from "@/utils/UI";
import grid from "@/mixins/grid";
import InstitutionsFilter from "@/components/Beneficiaries/InstitutionsFilter";
import permissions from "@/mixins/permissions";

export default {
	name: "InstitutionsList",

	components: {
		InstitutionsFilter,
		SafeDelete,
		Table,
		ActionButton,
	},

	mixins: [grid, permissions],

	data() {
		return {
			advancedSearchVisible: false,
			filter: [],
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{ key: "name" },
					{ key: "type" },
					{ key: "contactGivenName", label: "Contact Name" },
					{ key: "contactFamilyName" },
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
			await InstitutionService.getListOfInstitutions(
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.table.searchPhrase,
				this.filters,
			).then(({ data, totalCount }) => {
				this.table.total = totalCount;
				this.table.data = data;
			}).catch((e) => {
				if (e.message) Notification(`${this.$t("Institutions")} ${e}`, "is-danger");
			});

			this.isLoadingList = false;
		},

		filtersToggle() {
			this.advancedSearchVisible = !this.advancedSearchVisible;
		},

		async onFiltersChange(selectedFilters) {
			this.filters = selectedFilters;
			await this.fetchData();
		},

		showDetail(entity) {
			if (this.userCan.viewBeneficiary) this.$emit("onShowDetail", entity);
		},
	},
};
</script>
