<template>
	<div>
		<div class="level">
			<div class="level-left">
				<h1 class="title">Households</h1>
			</div>

			<div class="level-right">
				<b-dropdown position="is-bottom-left">
					<b-button
						type="is-primary"
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
								<small>Import from file</small>
								<h2>Import</h2>
							</div>
						</div>
					</b-dropdown-item>
					<b-dropdown-item
						:value="false"
						@click="goToCreatePage"
					>
							<b-icon class="media-left" icon="user-plus" />
						<div class="media">
							<div class="media-content">
								<h2>Add Beneficiary</h2>
								<small>Create household form</small>
							</div>
						</div>
					</b-dropdown-item>
				</b-dropdown>
			</div>
		</div>

		<Modal
			can-cancel
			header="Household Detail"
			:active="householdDetailModal.isOpened"
			@close="closeHouseholdDetailModal"
		>
			<HouseholdDetail
				close-button
				:form-model="householdModel"
				class="modal-card"
				@formClosed="closeHouseholdDetailModal"
			/>
		</Modal>
		<Table
			ref="householdList"
			has-reset-sort
			has-search
			checkable
			paginated
			:data="table.data"
			:total="table.total"
			:current-page="table.currentPage"
			:is-loading="isLoadingList"
			@clicked="goToSummaryDetail"
			@pageChanged="onPageChange"
			@sorted="onSort"
			@search="onSearch"
			@changePerPage="onChangePerPage"
			@resetSort="resetSort"
		>
			<template #progress>
				<b-progress :value="table.progress" format="percent" />
			</template>

			<template v-for="column in table.columns">
				<b-table-column
					v-bind="column"
					sortable
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
				<div class="buttons is-right">
					<ActionButton
						icon="search"
						type="is-primary"
						tooltip="Go To Detail"
						@click.native="showDetail(props.row.id)"
					/>
					<ActionButton
						icon="edit"
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

			<template #filterButton>
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

			<template #export>
				<div class="column is-two-fifths">
					<ExportButton
						space-between
						:formats="{ xlsx: true, csv: true, ods: true}"
						@exportData="exportHousehold"
					/>
				</div>
			</template>

			<template #filter>
				<b-collapse v-model="advancedSearchVisible">
					<HouseholdsFilters
						@filtersChanged="onFiltersChange"
					/>
				</b-collapse>
			</template>
		</Table>
	</div>
</template>

<script>
import ColumnField from "@/components/DataGrid/ColumnField";
import ActionButton from "@/components/ActionButton";
import SafeDelete from "@/components/SafeDelete";
import Modal from "@/components/Modal";
import Table from "@/components/DataGrid/Table";
import BeneficiariesService from "@/services/BeneficiariesService";
import ProjectsService from "@/services/ProjectsService";
import AddressService from "@/services/AddressService";
import { Notification, Toast } from "@/utils/UI";
import { generateColumns, normalizeText } from "@/utils/datagrid";
import grid from "@/mixins/grid";
import ExportButton from "@/components/ExportButton";
import addressHelper from "@/mixins/addressHelper";
import HouseholdDetail from "@/components/Beneficiaries/Household/HouseholdDetail";

const HouseholdsFilters = () => import("@/components/Beneficiaries/HouseholdsFilters");

export default {
	name: "HouseholdPage",

	components: {
		HouseholdDetail,
		ExportButton,
		Table,
		ActionButton,
		HouseholdsFilters,
		SafeDelete,
		ColumnField,
		Modal,
	},

	mixins: [grid, addressHelper],

	data() {
		return {
			advancedSearchVisible: false,
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{ key: "id", label: "Household ID", width: "30" },
					{ key: "familyName", label: "Family Name", width: "30", sortKey: "localFamilyName" },
					{ key: "givenName", label: "First Name", width: "30", sortKey: "localFirstName" },
					{ key: "members", width: "30", sortKey: "dependents" },
					{ key: "vulnerabilities", width: "30" },
					{ key: "idNumber", label: "ID Number", width: "30", sortKey: "nationalId" },
					{ key: "projects", label: "Projects", width: "30" },
					{ key: "currentLocation", label: "Current Location", width: "30", sortKey: "currentHouseholdLocation" },
				],
				total: 0,
				currentPage: 1,
				sortColumn: "",
				sortDirection: "desc",
				progress: null,
				searchPhrase: "",
			},
			checkedRows: [],
			filters: {},
			householdDetailModal: {
				isOpened: false,
			},
			householdModel: {},
			options: {
				assets: [],
				shelterStatuses: [],
				externalSupportReceivedType: [],
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

			this.table.progress = null;

			this.table.columns = generateColumns(this.table.visibleColumns);
			await BeneficiariesService.getListOfHouseholds(
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.table.searchPhrase,
				this.filters,
			).then(async ({ totalCount, data }) => {
				this.table.data = [];
				this.table.progress = 0;
				this.table.total = totalCount;
				if (data.length > 0) {
					await this.prepareDataForTable(data);
				}
				this.isLoadingList = false;
			}).catch((e) => {
				Notification(`Households ${e}`, "is-danger");
			});
		},

		prepareDataForTable(data) {
			this.table.progress = 5;
			const projectIds = [];
			const beneficiaryIds = [];
			const addressIds = {
				camp: [],
				residence: [],
				temporary_settlement: [],
			};
			data.forEach((item, key) => {
				this.table.data[key] = item;
				projectIds.push(...item.projectIds);
				beneficiaryIds.push(item.householdHeadId);
				const { typeOfLocation, addressId } = this.getAddressTypeAndId(item);
				addressIds[typeOfLocation].push(addressId);
				this.table.data[key].addressId = addressId;
				this.table.data[key].members = item.beneficiaryIds.length;
			});

			this.prepareProjectForTable([...new Set(projectIds)]);

			this.prepareBeneficiaryForTable([...new Set(beneficiaryIds)]);

			this.prepareAddressForTable(addressIds);

			this.table.progress = 100;
		},

		async prepareBeneficiaryForTable(beneficiaryIds) {
			const beneficiaries = await this.getBeneficiaries(beneficiaryIds);
			this.table.progress += 10;
			const nationalIdIds = [];
			this.table.data.forEach((item, key) => {
				const {
					givenName,
					familyName,
					nationalId,
					vulnerabilities,
				} = this.prepareBeneficiaries(item.householdHeadId, beneficiaries);
				this.table.data[key].vulnerabilities = vulnerabilities;
				this.table.data[key].givenName = givenName;
				this.table.data[key].familyName = familyName;
				this.table.data[key].nationalId = nationalId;
				nationalIdIds.push(nationalId);
			});
			this.table.progress += 5;
			this.getNationalIds(nationalIdIds)
				.then((nationalIdResult) => {
					this.table.progress += 5;
					this.table.data.forEach((item, key) => {
						this.table.data[key]
							.idNumber = this.prepareEntityForTable(item.nationalId, nationalIdResult, "number", "none");
					});
				});
		},

		async prepareAddressForTable(addressIds) {
			const mappedLocations = await this.getPreparedLocations(addressIds);
			this.table.data.map(async (item, key) => {
				this.table.data[key]
					.currentLocation = (this.prepareEntityForTable(item.addressId, mappedLocations, "locationName"));
			});
			this.table.progress += 5;
		},

		async prepareProjectForTable(projectIds) {
			const projects = await this.getProjects(projectIds);
			this.table.progress += 10;
			this.table.data.forEach((item, key) => {
				this.table.data[key].projects = this.prepareProjects(item, projects);
			});
		},

		async getNationalIds(ids) {
			return BeneficiariesService.getNationalIds(ids)
				.then(({ data }) => data).catch((e) => {
					Notification(`NationalIds ${e}`, "is-danger");
				});
		},

		// Replaces method from addressHelper
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
			return addresses;
		},

		async getProjects(ids) {
			return ProjectsService.getListOfProjects(null, null, null, null, ids)
				.then(({ data }) => data)
				.catch((e) => {
					Notification(`Projects ${e}`, "is-danger");
				});
		},

		async getBeneficiaries(ids) {
			return BeneficiariesService.getBeneficiaries(ids)
				.then(({ data }) => data)
				.catch((e) => {
					Notification(`Beneficiaries ${e}`, "is-danger");
				});
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

			return result;
		},

		prepareBeneficiaries(id, beneficiaries) {
			if (!beneficiaries?.length) return "";
			const result = {
				familyName: "",
				givenName: "",
				nationalId: "",
				vulnerabilities: "",
			};
			const beneficiary = beneficiaries.find((item) => item.id === id);
			if (beneficiary) {
				result.familyName = this.prepareName(beneficiary.localFamilyName, beneficiary.enFamilyName);
				result.givenName = this.prepareName(beneficiary.localGivenName, beneficiary.enGivenName);
				const [nationalId] = beneficiary.nationalIds;
				result.nationalId = nationalId;
				result.vulnerabilities = this
					.prepareVulnerabilities(beneficiary.vulnerabilityCriteria);
			}

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

			return result;
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
				Toast(`Household ${e}`, "is-danger");
			});
		},

		exportHousehold(format) {
			console.log(format);
			console.log(this.$refs.householdList.checkedRows);
		},

		async onFiltersChange(selectedFilters) {
			this.filters = selectedFilters;
			await this.fetchData();
		},

		closeHouseholdDetailModal() {
			this.householdDetailModal.isOpened = false;
		},

		showDetail(id) {
			this.mapHouseholdDetail(this.table.data.find((item) => item.id === id));
			console.log(this.householdModel);
			this.householdDetailModal.isOpened = true;
		},

		mapHouseholdDetail(household) {
			this.householdModel = {
				...household,
			};
		},
	},
};
</script>
