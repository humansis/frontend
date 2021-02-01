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
		<b-progress :value="table.progress" format="percent" />
		<Table
			ref="householdList"
			:data="table.data"
			:total="table.total"
			:current-page="table.currentPage"
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
import { mapState } from "vuex";
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
				sortColumn: "",
				sortDirection: "desc",
				progress: null,
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

	computed: {
		...mapState(["perPage"]),
	},

	methods: {
		async fetchData(value) {
			this.searchPhrase = value;

			this.isLoadingList = true;

			this.table.progress = null;

			this.table.columns = generateColumns(this.table.visibleColumns);
			await BeneficiariesService.getListOfHouseholds(
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.searchPhrase,
				this.filters,
			).then(async ({ totalCount, data }) => {
				this.table.progress = 0;
				this.table.total = totalCount;
				if (totalCount !== 0) {
					this.table.data = await this.prepareDataForTable(data);
				}
				this.isLoadingList = false;
			}).catch((e) => {
				Notification(`Households ${e}`, "is-danger");
			});
		},

		async prepareDataForTable(data) {
			this.table.progress = 5;
			const filledData = [];
			const projectIds = [];
			const beneficiaryIds = [];
			const addressIds = {
				camp: [],
				residence: [],
				temporary_settlement: [],
			};
			let promise = data.map(async (item, key) => {
				projectIds.push(...data[key].projectIds);
				beneficiaryIds.push(data[key].householdHeadId);
				const { typeOfLocation, addressId } = this.getAddressTypeAndId(item);
				addressIds[typeOfLocation].push(addressId);
				filledData[key] = item;
				filledData[key].addressId = addressId;
				filledData[key].members = data[key].beneficiaryIds.length;
			});
			await Promise.all(promise);

			const addresses = await this.getAddresses(addressIds);
			const locations = await this.getLocations(addresses);
			const mappedAddresses = this.mapLocationOnAddress(locations, addresses);
			const projects = await this.getProjects([...new Set(projectIds)]);
			const beneficiaries = await this.getBeneficiaries([...new Set(beneficiaryIds)]);
			const nationalIds = await this.getNationalIds(beneficiaries);

			promise = await data.map(async (item, key) => {
				filledData[key].projects = this.prepareProjects(item, projects);
				filledData[key]
					.currentLocation = this.prepareLocations(item.addressId, mappedAddresses);
				const {
					givenName,
					familyName,
					nationalId,
					vulnerabilities,
				} = this.prepareBeneficiaries(data[key].householdHeadId, beneficiaries);
				filledData[key].idNumber = this.prepareNationalId(nationalId, nationalIds);
				filledData[key].vulnerabilities	= vulnerabilities;
				filledData[key].givenName = givenName;
				filledData[key].familyName = familyName;
			});
			await Promise.all(promise);
			this.table.progress = 100;

			return filledData;
		},

		mapLocationOnAddress(locations, addresses) {
			if (!locations.length) return [];
			const addressesMapped = [];
			addresses.forEach((address) => {
				const location = locations.find((item) => item.adm.locationId === address.locationId);
				if (location) {
					const addressMapped = address;
					addressMapped.locationName = location.adm.name;
					addressesMapped.push(addressMapped);
				}
			});
			return addressesMapped;
		},

		async getNationalIds(beneficiaries) {
			return BeneficiariesService.getNationalIds(beneficiaries, "nationalIds")
				.then(({ data }) => {
					this.table.progress += 15;
					return data;
				}).catch((e) => {
					Notification(`NationalIds ${e}`, "is-danger");
				});
		},

		async getAddresses(ids) {
			const addresses = [];
			if (ids.camp.length) {
				await AddressService.getCampAddresses(ids.camp)
					.then(({ data }) => {
						data.forEach(({ locationId, id }) => {
							addresses.push({ locationId, id, type: "camp" });
						});
					}).catch((e) => {
						Notification(`Camp Address ${e}`, "is-danger");
					});
			}
			if (ids.residence.length) {
				await AddressService.getResidenceAddresses(ids.residence)
					.then(({ data }) => {
						data.forEach(({ locationId, id }) => {
							addresses.push({ locationId, id, type: "residence" });
						});
					}).catch((e) => {
						Notification(`Residence Address ${e}`, "is-danger");
					});
			}
			if (ids.temporary_settlement.length) {
				await AddressService.getTemporarySettlementAddresses(ids.temporary_settlement)
					.then(({ data }) => {
						data.forEach(({ locationId, id }) => {
							addresses.push({ locationId, id, type: "temporary_settlement" });
						});
					}).catch((e) => {
						Notification(`Temporary Settlement Address ${e}`, "is-danger");
					});
			}
			this.table.progress += 15;
			return addresses;
		},

		async getProjects(ids) {
			return ProjectsService.getListOfProjects(null, null, null, null, ids)
				.then(({ data }) => {
					this.table.progress += 15;
					return data;
				}).catch((e) => {
					Notification(`Projects ${e}`, "is-danger");
				});
		},

		async getBeneficiaries(ids) {
			return BeneficiariesService.getBeneficiaries(ids)
				.then(({ data }) => {
					this.table.progress += 15;
					return data;
				}).catch((e) => {
					Notification(`Beneficiaries ${e}`, "is-danger");
				});
		},

		async getLocations(addresses) {
			if (!addresses.length) return [];
			return LocationsService.getLocations(addresses, "locationId")
				.then(({ data }) => {
					this.table.progress += 15;
					return data;
				}).catch((e) => {
					Notification(`Locations ${e}`, "is-danger");
				});
		},

		prepareNationalId(id, nationalIds) {
			if (!nationalIds.length) return "none";
			const nationalId = nationalIds.find((item) => item.id === id);
			this.table.progress += 5;
			return nationalId ? nationalId.number : "none";
		},

		prepareVulnerabilities(vulnerabilities) {
			let result = "none";
			if (vulnerabilities) {
				vulnerabilities.forEach((item) => {
					if (result === "none") {
						result = normalizeText(item);
					} else {
						result += `, ${normalizeText(item)}`;
					}
				});
			}

			this.table.progress += 5;
			return result;
		},

		prepareBeneficiaries(id, beneficiaries) {
			if (!beneficiaries.length) return "";
			const result = {
				familyName: "",
				givenName: "",
				nationalId: "",
				vulnerabilities: "",
			};
			const beneficiary = beneficiaries.find((item) => item.id === id);
			if (beneficiary) {
				result.familyName = beneficiary.localFamilyName;
				if (beneficiary.enFamilyName) {
					result.familyName += ` (${beneficiary.enFamilyName})`;
				}
				result.givenName = beneficiary.localGivenName;
				if (beneficiary.enGivenName) {
					result.givenName += ` (${beneficiary.enGivenName})`;
				}
				const [nationalId] = beneficiary.nationalIds;
				result.nationalId = nationalId;
				result.vulnerabilities = this
					.prepareVulnerabilities(beneficiary.vulnerabilityCriteria);
			}

			this.table.progress += 5;
			return result;
		},

		prepareProjects(item, projects) {
			let result = "";

			item.projectIds.forEach((id) => {
				const foundProject = projects.find((project) => project.id === id);
				if (foundProject) {
					if (result === "") {
						result = foundProject.name;
					} else {
						result += `, ${foundProject.name}`;
					}
				}
			});

			this.table.progress += 5;
			return result;
		},

		prepareLocations(id, addresses) {
			if (!addresses) return "";
			const location = addresses.find((address) => address.id === id);
			this.table.progress += 5;
			return location ? location.locationName : "";
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
