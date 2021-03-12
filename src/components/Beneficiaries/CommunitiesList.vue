<template>
	<div>
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
				label="Actions"
				width="150"
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
						entity="Community"
						tooltip="Delete"
						:id="props.row.id"
						@submitted="remove"
					/>
				</div>
			</b-table-column>
			<template slot="filterButton">
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
			</template>
			<template slot="filter">
				<b-collapse v-model="advancedSearchVisible">
					<CommunitiesFilter
						@filtersChanged="onFiltersChange"
					/>
				</b-collapse>
			</template>
		</Table>
	</div>
</template>

<script>
import SafeDelete from "@/components/SafeDelete";
import Table from "@/components/DataGrid/Table";
import ActionButton from "@/components/ActionButton";
import CommunitiesService from "@/services/CommunitiesService";
import { generateColumns } from "@/utils/datagrid";
import { Notification } from "@/utils/UI";
import grid from "@/mixins/grid";
import CommunitiesFilter from "@/components/Beneficiaries/CommunitiesFilter";
import addressHelper from "@/mixins/addressHelper";

export default {
	name: "CommunitiesList",

	components: {
		CommunitiesFilter,
		SafeDelete,
		Table,
		ActionButton,
	},

	mixins: [grid, addressHelper],

	data() {
		return {
			advancedSearchVisible: false,
			filter: [],
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{ key: "name" },
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
			await CommunitiesService.getListOfCommunities(
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.table.searchPhrase,
				this.filters,
			).then(async ({ data, totalCount }) => {
				this.table.total = totalCount;
				this.table.data = await this.prepareDataForTable(data);
			}).catch((e) => {
				Notification(`Communities ${e}`, "is-danger");
			});

			this.isLoadingList = false;
		},

		async prepareDataForTable(data) {
			const filledData = [];
			const addressIds = [];
			data.map(async (item, key) => {
				filledData[key] = item;
				addressIds.push((item.addressId));
			});
			const mappedAddresses = await this.getPreparedLocations(addressIds);

			data.forEach((item, key) => {
				filledData[key].name = this.prepareLocations(item.addressId, mappedAddresses);
			});

			return filledData;
		},

		prepareLocations(id, addresses) {
			if (!addresses) return "";
			const location = addresses.find((address) => address.id === id);
			return location ? location.locationName : "";
		},

		filtersToggle() {
			this.advancedSearchVisible = !this.advancedSearchVisible;
		},

		async onFiltersChange(selectedFilters) {
			this.filters = selectedFilters;
			await this.fetchData();
		},
	},
};
</script>
