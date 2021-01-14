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
		<div class="columns">
			<Search class="column is-two-fifths" @search="fetchData" />
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
			<ExportButton
				type="is-success"
				size="is-default"
				class="column is-three-fifths"
				space-between
				:formats="{ xlsx: true, csv: true, ods: true}"
				@exportData="exportHousehold"
			/>
		</div>
		<b-collapse v-model="advancedSearchVisible">
			<HouseholdsFilters
				@filtersChanged="onFiltersChange"
			/>
		</b-collapse>
		<Table
			ref="householdList"
			:data="table.data"
			:total="table.total"
			:current-page="table.currentPage"
			:per-page="table.perPage"
			:is-loading="isLoadingList"
			checkable
			paginated
			@clicked="goToSummaryDetail"
			@pageChanged="onPageChange"
			@sorted="onSort"
			@changePerPage="onChangePerPage"
		>
			<template v-for="column in table.columns">
				<b-table-column v-bind="column" :key="column.id" sortable>
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
						type="is-info"
						tooltip="Go To Detail"
						@click.native="goToSummaryDetail(props.row.id)"
					/>
					<ActionButton
						icon="edit"
						type="is-link"
						tooltip="Edit"
						@click.native="editHousehold(props.row.id)"
					/>
					<SafeDelete
						icon="trash"
						entity="Household"
						tooltip="Delete"
						:id="props.row.id"
						@submitted="remove"
					/>
				</div>
			</b-table-column>

		</Table>
	</div>
</template>

<script>
import { Notification, Toast } from "@/utils/UI";
import { generateColumns, normalizeText } from "@/utils/datagrid";
import BeneficiariesService from "@/services/BeneficiariesService";
import LocationsService from "@/services/LocationsService";
import ProjectsService from "@/services/ProjectsService";
import Table from "@/components/DataGrid/Table";
import ActionButton from "@/components/ActionButton";
import Search from "@/components/Search";
import ExportButton from "@/components/ExportButton";
import grid from "@/mixins/grid";
import SafeDelete from "@/components/SafeDelete";

const HouseholdsFilters = () => import("@/components/Beneficiaries/HouseholdsFilters");

export default {
	name: "HouseholdPage",

	components: {
		Search,
		ExportButton,
		Table,
		ActionButton,
		HouseholdsFilters,
		SafeDelete,
	},

	mixins: [grid],

	data() {
		return {
			advancedSearchVisible: false,
			searchPhrase: "",
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{
						key: "id",
						label: "Household ID",
					},
					{
						key: "familyName",
						label: "Family Name",
					},
					{
						key: "givenName",
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
						label: "Projects",
					},
					{
						key: "currentLocation",
						label: "Current Location",
					},
				],
				total: 0,
				currentPage: 1,
				perPage: 15,
				sortColumn: "",
				sortDirection: "desc",
			},
			checkedRows: [],
			filters: {},
			waiting: 0,
			preparedData: [],
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
			this.searchPhrase = value;

			this.isLoadingList = true;

			this.table.columns = generateColumns(this.table.visibleColumns);
			await BeneficiariesService.getListOfHouseholds(
				this.table.currentPage,
				this.table.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.searchPhrase,
				this.filters,
			).then(({ totalCount, data }) => {
				this.table.total = totalCount;
				this.preparedData = data;
				this.prepareDataForTable(this.preparedData);
			}).catch((e) => {
				Notification(`Households ${e}`, "is-danger");
			});
		},

		async prepareDataForTable(data) {
			this.waiting = 0;
			data.map(async (item, key) => {
				/* eslint-disable */
				data[key].members = data[key].beneficiaryIds.length;
				data[key] = await this.prepareProjects(data[key]);
				data[key] = await this.prepareBeneficiaries(data[key]);
				data[key] = await this.prepareLocations(data[key]);
				/* eslint-enable */
			});
		},

		async prepareBeneficiaries(item) {
			const preparedItem = item;
			preparedItem.familyName = "";
			preparedItem.givenName = "";
			BeneficiariesService.getBeneficiary(preparedItem.beneficiaryIds[0])
				.then(async (response) => {
					preparedItem.familyName = response.localFamilyName;
					if (response.enFamilyName) {
						preparedItem.familyName += ` (${response.enFamilyName})`;
					}
					preparedItem.givenName = response.localGivenName;
					if (response.enGivenName) {
						preparedItem.givenName += ` (${response.enGivenName})`;
					}
				});
			this.isLast();
			return preparedItem;
		},

		async prepareLocations(item) {
			const preparedItem = item;
			preparedItem.currentLocation = "";
			const locationId = preparedItem.temporarySettlementAddressId
				|| preparedItem.campAddressId
				|| preparedItem.residenceAddressId;
			return LocationsService.getLocation(locationId)
				.then(async (location) => {
					if (location.data) {
						preparedItem.currentLocation = location.data.name;
					}
					this.isLast();
					return preparedItem;
				});
		},

		isLast() {
			// Wait for all data to be loaded and then show them in table
			this.waiting += 1;
			if (this.waiting === this.table.perPage * 3) {
				this.table.data = this.preparedData;
				this.isLoadingList = false;
			}
		},

		async prepareProjects(item) {
			const preparedItem = item;
			preparedItem.projects = "";
			preparedItem.projectIds.forEach((id, index) => {
				ProjectsService.getDetailOfProject(id)
					.then(async ({ data }) => {
						if (data.name !== undefined) {
							if (preparedItem.projects === "") {
								preparedItem.projects = data.name;
							} else {
								preparedItem.projects += ` ,${data.name}`;
							}
						}
						if (preparedItem.projectIds.length - 1 === index) {
							this.isLast();
						}
					});
			});
			return preparedItem;
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

		goToSummaryDetail(id) {
			this.$router.push({ name: "HouseholdInformationSummary", params: { householdId: id } });
		},

		editHousehold(id) {
			this.$router.push({ name: "EditHousehold", params: { householdId: id } });
		},

		async remove(id) {
			await BeneficiariesService.removeHousehold(id).then((response) => {
				if (response.status === 204) {
					Toast("Household Successfully Deleted", "is-success");
					this.fetchData();
				}
			}).catch((e) => {
				Notification(`Household ${e}`, "is-danger");
			});
		},

		exportHousehold(format) {
			console.log(format);
			console.log(this.$refs.householdList.checkedRows);
		},

		async onFiltersChange(selectedFilters) {
			Object.keys(selectedFilters).forEach((key) => {
				if (Array.isArray(selectedFilters[key])) {
					this.filters[key] = [];
					selectedFilters[key].forEach((value) => {
						this.filters[key].push(value.id);
					});
				} else if (selectedFilters[key]) {
					this.filters[key] = [selectedFilters[key].id];
				}
			});
			await this.fetchData(this.searchPhrase);
		},
	},
};
</script>
