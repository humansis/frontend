<template>
	<Table
		has-reset-sort
		has-search
		:data="table.data"
		:total="table.total"
		:current-page="table.currentPage"
		:is-loading="isLoadingList"
		:search-phrase="table.searchPhrase"
		@clicked="showDetail"
		@pageChanged="onPageChange"
		@sorted="onSort"
		@changePerPage="onChangePerPage"
		@resetSort="resetSort"
		@onSearch="onSearch"
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
			width="150"
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
					tooltip="Edit"
					@click="showEdit(props.row.id)"
				/>
				<SafeDelete
					v-if="userCan.deleteBeneficiary"
					icon="trash"
					:entity="$t('Community')"
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
				<CommunitiesFilter
					@filtersChanged="onFiltersChange"
					@onSearch="onSearch(table.searchPhrase)"
				/>
			</b-collapse>
		</template>
	</Table>
</template>

<script>
import SafeDelete from "@/components/SafeDelete";
import Table from "@/components/DataGrid/Table";
import ActionButton from "@/components/ActionButton";
import CommunityService from "@/services/CommunityService";
import { generateColumns } from "@/utils/datagrid";
import { Notification } from "@/utils/UI";
import grid from "@/mixins/grid";
import CommunitiesFilter from "@/components/Beneficiaries/CommunitiesFilter";
import addressHelper from "@/mixins/addressHelper";
import permissions from "@/mixins/permissions";

export default {
	name: "CommunitiesList",

	components: {
		CommunitiesFilter,
		SafeDelete,
		Table,
		ActionButton,
	},

	mixins: [grid, addressHelper, permissions],

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

	created() {
		this.fetchData();
	},

	methods: {
		async fetchData() {
			this.isLoadingList = true;

			this.table.columns = generateColumns(this.table.visibleColumns);
			await CommunityService.getListOfCommunities(
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.table.searchPhrase,
				this.filters,
			).then(async ({ data, totalCount }) => {
				this.table.total = totalCount;
				this.table.data = await this.prepareDataForTable(data);
			}).catch((e) => {
				if (e.message) Notification(`${this.$t("Communities")} ${e}`, "is-danger");
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

		async onFiltersChange({ filters }) {
			this.filters = filters;
			this.table.currentPage = 1;
			await this.fetchData();
		},

		showDetail(entity) {
			if (this.userCan.viewBeneficiary) this.$emit("onShowDetail", entity);
		},
	},
};
</script>
