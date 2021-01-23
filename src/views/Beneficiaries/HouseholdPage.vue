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
				<b-table-column
					v-bind="column"
					:key="column.id"
					v-slot="props"
				>
					<ColumnField :data="props" :column="column" />
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
import ColumnField from "@/components/DataGrid/ColumnField";
import ExportButton from "@/components/ExportButton";
import ActionButton from "@/components/ActionButton";
import SafeDelete from "@/components/SafeDelete";
import Table from "@/components/DataGrid/Table";
import Search from "@/components/Search";
import BeneficiariesService from "@/services/BeneficiariesService";
import LocationsService from "@/services/LocationsService";
import ProjectsService from "@/services/ProjectsService";
import AddressService from "@/services/AddressService";
import { Notification, Toast } from "@/utils/UI";
import { generateColumns, normalizeText } from "@/utils/datagrid";
import grid from "@/mixins/grid";

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
		ColumnField,
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
						width: "30",
					},
					{
						key: "familyName",
						label: "Family Name",
						width: "30",
					},
					{
						key: "givenName",
						label: "First Name",
						width: "30",
					},
					{
						key: "members",
						width: "30",
					},
					{
						key: "vulnerabilities",
						width: "30",
					},
					{
						key: "idNumber",
						label: "ID Number",
						width: "30",
					},
					{
						key: "projects",
						label: "Projects",
						width: "30",
					},
					{
						key: "currentLocation",
						label: "Current Location",
						width: "30",
					},
				],
				total: 0,
				currentPage: 1,
				perPage: 10,
				sortColumn: "",
				sortDirection: "desc",
			},
			checkedRows: [],
			filters: {},
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
			).then(async ({ totalCount, data }) => {
				this.table.total = totalCount;
				this.table.data = await this.prepareDataForTable(data);
				this.isLoadingList = false;
			}).catch((e) => {
				Notification(`Households ${e}`, "is-danger");
			});
		},

		async prepareDataForTable(data) {
			const filledData = [];
			const promise = data.map(async (item, key) => {
				filledData[key] = item;
				filledData[key].members = data[key].beneficiaryIds.length;
				filledData[key].projects = await this.prepareProjects(data[key]);
				filledData[key].currentLocation = await this.prepareLocations(data[key]);
				const {
					givenName,
					familyName,
					nationalIds,
					vulnerabilities,
				} = await this.prepareBeneficiaries(data[key]);
				filledData[key].idNumber = await this.prepareNationalId(nationalIds);
				filledData[key].vulnerabilities	= await this
					.prepareVulnerabilities(vulnerabilities);
				filledData[key].givenName = givenName;
				filledData[key].familyName = familyName;
			});
			await Promise.all(promise);

			return filledData;
		},

		async prepareNationalId(ids) {
			if (ids.length > 0) {
				return BeneficiariesService.getNationalId(ids[0])
					.then(({ number }) => number);
			}
			return "none";
		},

		async prepareVulnerabilities(vulnerabilities) {
			let result = "none";
			if (vulnerabilities) {
				await vulnerabilities.forEach((item) => {
					if (result === "none") {
						result = normalizeText(item);
					} else {
						result += `, ${normalizeText(item)}`;
					}
				});
			}
			return result;
		},

		async prepareBeneficiaries(item) {
			const result = {
				familyName: "",
				givenName: "",
				nationalIds: [],
				vulnerabilities: [],
			};
			await BeneficiariesService.getBeneficiary(item.householdHeadId)
				.then(async (response) => {
					result.familyName = response.localFamilyName;
					if (response.enFamilyName) {
						result.familyName += ` (${response.enFamilyName})`;
					}
					result.givenName = response.localGivenName;
					if (response.enGivenName) {
						result.givenName += ` (${response.enGivenName})`;
					}
					result.nationalIds = response.nationalIds;
					result.vulnerabilities = response.vulnerabilityCriteria;
				}).catch((e) => {
					Notification(`Beneficiary for ${item.id} ${e}`, "is-danger");
				});
			return result;
		},

		async prepareLocations(item) {
			// TODO fix after BE fix Internal Server Error on this endpoint
			// TODO fix after BE fix addresses, check if locationId is Correct
			return this.getAddress(item)
				.then(async ({ locationId }) => {
					await LocationsService.getLocation(locationId)
						.then(({ data }) => (data ? data.name : ""));
				}).catch((e) => {
					Notification(`Location for ${item.id} ${e}`, "is-danger");
				});
		},

		getAddressTypeAndId(
			{
				temporarySettlementAddressId,
				residenceAddressId,
				campAddressId,
			},
		) {
			if (temporarySettlementAddressId) return { typeOfLocation: "temporary_settlement", addressId: temporarySettlementAddressId };
			if (residenceAddressId) return { typeOfLocation: "residence", addressId: residenceAddressId };
			if (campAddressId) return { typeOfLocation: "camp", addressId: campAddressId };
			return "";
		},

		getAddress(item) {
			const { typeOfLocation, addressId } = this.getAddressTypeAndId(item);
			switch (typeOfLocation) {
				case "camp":
					return AddressService.getCampAddress(addressId);
				case "residence":
					return AddressService.getResidenceAddress(addressId);
				case "temporary_settlement":
					return AddressService.getTemporarySettlementAddress(addressId);
				default:
					return null;
			}
		},

		async prepareProjects(item) {
			let result = "";
			const promises = [];
			await item.projectIds.forEach((id) => {
				const promise = ProjectsService.getDetailOfProject(id)
					.then(({ data }) => {
						if (data.name) {
							if (result === "") {
								result = data.name;
							} else {
								result += ` ,${data.name}`;
							}
						}
					}).catch((e) => {
						Notification(`Project for ${item.id} ${e}`, "is-danger");
					});
				promises.push(promise);
			});
			await Promise.all(promises);

			return result;
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
