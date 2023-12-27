<template>
	<v-container fluid>
		<div class="d-flex mb-4">
			<h2 class="me-auto">{{ $t('Households') }}</h2>

			<v-menu>
				<template v-slot:activator="{ props }">
					<v-btn
						v-if="userCan.addBeneficiary"
						v-bind="props"
						color="primary"
						prepend-icon="plus"
						class="text-none ml-0"
					>
						{{ $t('Create') }}
					</v-btn>
				</template>

				<v-list>
					<router-link :to="{ name: 'Imports', query: { openModal: '1' } }">
						<v-list-item v-if="userCan.importBeneficiaries">
							<v-card
								:title="$t('Import')"
								:subtitle="$t('Import from File')"
								density="compact"
							>
								<template v-slot:prepend>
									<v-icon icon="upload" size="small" />
								</template>
							</v-card>
						</v-list-item>
					</router-link>

					<router-link :to="{ name: 'AddHousehold' }">
						<v-list-item>
							<v-card
								:title="$t('Add Beneficiary')"
								:subtitle="$t('Create household form')"
								density="compact"
							>
								<template v-slot:prepend>
									<v-icon icon="user-plus" size="small" />
								</template>
							</v-card>
						</v-list-item>
					</router-link>
				</v-list>
			</v-menu>
		</div>

		<Modal
			v-model="addToProjectModal.isOpened"
			header="Add Beneficiary to a Project"
		>
			<AddProjectToHousehold
				:loading="isLoading.projects"
				:options="options.projects"
				:confirm-button-loading="confirmButtonLoading"
				class="modal-card"
				close-button
				@formSubmitted="addHouseholdsToProject"
				@formClosed="closeAddToProjectModal"
			/>
		</Modal>

		<Modal
			v-model="householdDetailModal.isOpened"
			header="Household Detail"
		>
			<HouseholdDetail
				:household-model="householdModel"
				class="modal-card"
				close-button
				@formClosed="closeHouseholdDetailModal"
			/>
		</Modal>

		<DataGrid
			ref="households"
			v-model="table.checkedRows"
			v-model:page="table.currentPage"
			:items-per-page="perPage"
			:headers="table.columns"
			:items="table.data"
			:total-count="table.total"
			:loading="isLoading.households"
			:progress="table.progress"
			:search-phrase="table.searchPhrase"
			:is-search-disabled="bulkSearch.isBulkSearchUsed"
			reset-filters-button
			reset-sort-button
			is-search-visible
			show-select
			@update:sortBy="onSort"
			@search="onSearch"
			@pageChanged="onPageChange"
			@perPageChanged="onPerPageChange"
			@resetFilters="onResetFilters"
			@resetSort="onResetSort(TABLE.DEFAULT_SORT_OPTIONS.HOUSEHOLDS)"
		>
			<template v-slot:actions="{ row: { householdId } }">
				<ButtonAction
					v-if="userCan.viewBeneficiary"
					:disabled="!householdsSelects"
					icon="search"
					icon-color="primary"
					label="Show Detail"
					@actionConfirmed="showHouseholdDetail(householdId)"
				/>

				<ButtonAction
					v-if="userCan.viewBeneficiary"
					:disabled="!householdsSelects"
					icon="edit"
					label="Edit"
					@actionConfirmed="$router.push({ name: 'EditHousehold', params: { householdId } })"
				/>

				<ButtonAction
					v-if="userCan.deleteBeneficiary"
					:disabled="!householdsSelects"
					icon="trash"
					label="Delete"
					icon-color="red"
					confirm-title="Deleting Household"
					confirm-message="Are you sure sure you want to delete Household?"
					prepend-icon="circle-exclamation"
					prepend-icon-color="red"
					is-confirm-action
					@actionConfirmed="removeHousehold(householdId)"
				/>
			</template>

			<template v-slot:tableControls>
				<ExportControl
					:disabled="!table.data.length || !table.dataUpdated"
					:available-export-formats="exportControl.formats"
					:available-export-types="exportControl.types"
					:is-export-loading="exportControl.loading"
					:location="exportControl.location"
					@export="exportHouseholds"
				/>

				<v-btn
					:append-icon="isAdvancedSearchVisible ? 'arrow-up' : 'arrow-down'"
					size="small"
					color="blue-grey-lighten-4"
					variant="elevated"
					class="ml-4 text-none"
					@click="advancedSearchToggle"
				>
					{{ $t('Advanced Search') }}
				</v-btn>

				<v-btn
					:append-icon="isBulkSearchVisible ? 'arrow-up' : 'arrow-down'"
					size="small"
					color="blue-grey-lighten-4"
					variant="elevated"
					class="ml-4 text-none"
					@click="bulkSearchToggle"
				>
					{{ $t('Bulk Search') }}
				</v-btn>

				<v-menu v-if="isActionsButtonVisible">
					<template v-slot:activator="{ props }">
						<v-btn
							v-bind="props"
							:append-icon="props.open ? 'arrow-up' : 'arrow-down'"
							color="primary ml-4"
						>
							{{ $t('Actions') }}
						</v-btn>
					</template>

					<v-list>
						<v-list-item @click="showAddToProjectModal">
							<v-icon class="mr-1" icon="plus" />
							{{ $t('Add to Project') }}
						</v-list-item>
						<v-list-item @click="saveDeleteOfMultipleHouseholds">
							<v-icon class="mr-1" icon="trash" />
							{{ $t('Delete') }}
						</v-list-item>
					</v-list>
				</v-menu>
			</template>

			<template v-slot:advancedControls>
				<v-expansion-panels v-model="visiblePanels">
					<v-expansion-panel value="advancedSearch" class="mt-0" eager>
						<v-expansion-panel-text>
							<HouseholdsFilter
								ref="householdsFilter"
								:defaultFilters="{ ...filters, ...locationsFilter }"
								@filtersChanged="onFiltersChange"
								@search="clickedSearch"
							/>
						</v-expansion-panel-text>
					</v-expansion-panel>
					<v-expansion-panel value="bulkSearch" class="mt-0" eager>
						<v-expansion-panel-text>
							<BulkSearch
								ref="bulkSearch"
								@clickedBulkSearch="clickedBulkSearch"
								@bulkSearchChanged="bulkSearchChanged"
							/>
						</v-expansion-panel-text>
					</v-expansion-panel>
				</v-expansion-panels>
			</template>
		</DataGrid>
	</v-container>
</template>

<script>
import { defineAsyncComponent } from "vue";
import AddressService from "@/services/AddressService";
import BeneficiariesService from "@/services/BeneficiariesService";
import ProjectService from "@/services/ProjectService";
import AddProjectToHousehold from "@/components/Beneficiaries/Household/AddProjectToHousehold";
import HouseholdDetail from "@/components/Beneficiaries/Household/HouseholdDetail";
import ButtonAction from "@/components/ButtonAction";
import DataGrid from "@/components/DataGrid";
import ExportControl from "@/components/Inputs/ExportControl";
import Modal from "@/components/Inputs/Modal";
import addressHelper from "@/mixins/addressHelper";
import grid from "@/mixins/grid";
import permissions from "@/mixins/permissions";
import urlFiltersHelper from "@/mixins/urlFiltersHelper";
import validation from "@/mixins/validation";
import { getUniqueIds } from "@/utils/customValidators";
import { generateColumns, normalizeExportDate, normalizeText } from "@/utils/datagrid";
import { downloadFile } from "@/utils/helpers";
import { Notification } from "@/utils/UI";
import { EXPORT, TABLE } from "@/consts";

export default {
	name: "HouseholdPage",

	components: {
		AddProjectToHousehold,
		BulkSearch: defineAsyncComponent(() => import("@/components/Beneficiaries/Household/BulkSearch")),
		ButtonAction,
		DataGrid,
		ExportControl,
		HouseholdDetail,
		HouseholdsFilter: defineAsyncComponent(() => import("@/components/Beneficiaries/Household/HouseholdsFilter")),
		Modal,
	},

	mixins: [
		grid,
		addressHelper,
		permissions,
		urlFiltersHelper,
		validation,
	],

	data() {
		return {
			TABLE,
			visiblePanels: [],
			householdsSelects: true,
			exportControl: {
				loading: false,
				location: "households",
				types: [EXPORT.HOUSEHOLDS],
				formats: [EXPORT.FORMAT_XLSX, EXPORT.FORMAT_CSV, EXPORT.FORMAT_ODS],
			},
			table: {
				data: [],
				columns: generateColumns([
					{ key: "id", title: "Household ID", type: "link", width: "30" },
					{ key: "familyName", title: "Local family name", width: "30", sortKey: "localFamilyName" },
					{ key: "givenName", title: "Local given name", width: "30", sortKey: "localFirstName" },
					{ key: "members", width: "30", sortKey: "dependents" },
					{ key: "vulnerabilities", type: "svgIcon", width: "30" },
					{ key: "idNumbers", title: "ID Numbers", width: "30", sortKey: "nationalId" },
					{ key: "projects", title: "Projects", width: "30" },
					{ key: "currentLocation", title: "Current Location", width: "30", sortKey: "currentHouseholdLocation" },
					{ key: "actions", value: "actions", sortable: false },
				]),
				total: 0,
				currentPage: 1,
				sortColumn: TABLE.DEFAULT_SORT_OPTIONS.HOUSEHOLDS.key,
				sortDirection: TABLE.DEFAULT_SORT_OPTIONS.HOUSEHOLDS.order,
				progress: null,
				searchPhrase: "",
				checkedRows: [],
				dataUpdated: false,
			},
			filters: {},
			bulkSearch: {},
			locationsFilter: {},
			householdDetailModal: {
				isOpened: false,
			},
			addToProjectModal: {
				isOpened: false,
			},
			householdModel: {},
			options: {
				assets: [],
				shelterStatuses: [],
				externalSupportReceivedType: [],
				projects: [],
			},
			isActionsButtonVisible: false,
			confirmButtonLoading: false,
			selectedProject: null,
			isLoading: {
				households: false,
				projects: false,
			},
		};
	},

	computed: {
		arrayIds() {
			return this.bulkSearch.ids?.split(/\s+/);
		},

		isAdvancedSearchVisible() {
			return this.visiblePanels.includes("advancedSearch");
		},

		isBulkSearchVisible() {
			return this.visiblePanels.includes("bulkSearch");
		},
	},

	watch: {
		"table.checkedRows": {
			handler: "onRowsChecked",
			deep: true,
		},
	},

	created() {
		this.setGridFilters("households");
		this.fetchData();
	},

	methods: {
		async fetchData() {
			this.isLoading.households = true;
			this.table.progress = null;

			if (
				this.bulkSearch.isBulkSearchUsed
				&& this.bulkSearch.searchBy?.length
				&& this.arrayIds.length
			) {
				await this.fetchBulkSearchData();
			} else {
				await this.fetchStandardData();
			}

			this.setGridFiltersToUrl("households");
		},

		async fetchStandardData() {
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
				this.table.dataUpdated = true;
				if (data.length > 0) {
					await this.prepareDataForTable(data);
				}
				this.isLoading.households = false;
			}).catch((e) => {
				Notification(`${this.$t("Households")} ${e.message || e}`, "error");
			});
		},

		async fetchBulkSearchData() {
			try {
				const { data: { result: { data, totalCount }, notFoundIds } } = await BeneficiariesService
					.getListOfHouseholdByBulkSearch(
						this.table.currentPage,
						this.perPage,
						this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
						{
							searchBy: this.bulkSearch.searchBy,
							searchIds: this.arrayIds,
						},
					);

				this.table.data = [];
				this.table.progress = 0;
				this.table.total = totalCount;
				this.table.dataUpdated = true;
				this.bulkSearch.notFoundIds = notFoundIds.join(" ");
				this.bulkSearch.isBulkSearchUsed = true;

				if (data.length > 0) {
					await this.prepareDataForTable(data);
				}
				this.isLoading.households = false;
			} catch (e) {
				Notification(`${this.$t("Bulk Search")} ${e.message || e}`, "error");
			}
		},

		async exportHouseholds(exportType, format) {
			if (exportType === EXPORT.HOUSEHOLDS) {
				let ids = [];
				const filename = `BNF Households ${normalizeExportDate()}`;

				if (!this.householdsSelects) {
					ids = this.table.checkedRows.map((item) => item.householdId);
				}

				if (this.bulkSearch.isBulkSearchUsed) {
					try {
						this.exportControl.loading = true;

						const body = {
							searchBy: this.bulkSearch.searchBy,
							searchIds: this.bulkSearch.ids.split(" "),
						};
						const { data, status, message } = await BeneficiariesService.exportBulkSearchHouseholds(
							format,
							ids,
							body,
						);

						downloadFile(data, filename, status, format, message);
					} catch (e) {
						Notification(
							`${this.$t("Export Households (bulk search)")} ${e.message || e}`,
							"error",
						);
					} finally {
						this.exportControl.loading = false;
					}
				} else {
					try {
						const { data, status, message } = await BeneficiariesService.exportHouseholds(
							format,
							ids,
							this.filters,
						);

						downloadFile(data, filename, status, format, message);
					} catch (e) {
						Notification(
							`${this.$t("Export Households")} ${e.message || e}`,
							"error",
						);
					} finally {
						this.exportControl.loading = false;
					}
				}
			}
		},

		onRowsChecked(rows) {
			this.isActionsButtonVisible = !!rows?.length;
			this.householdsSelects = !rows?.length;
		},

		clickedBulkSearch(bulkSearchData) {
			this.bulkSearch = bulkSearchData;
			this.fetchData();
		},

		bulkSearchChanged() {
			this.table.dataUpdated = false;
		},

		clickedSearch() {
			this.bulkSearch.isBulkSearchUsed = false;
			this.onSearch(this.table.searchPhrase);
		},

		async addHouseholdsToProject(project) {
			this.selectedProject = project;
			this.confirmButtonLoading = true;

			if (this.table.checkedRows?.length && this.selectedProject) {
				const householdsIds = this.table.checkedRows.map((household) => household.householdId);

				await BeneficiariesService
					.addHouseholdsToProject(this.selectedProject.id, householdsIds)
					.then(() => {
						this.table.checkedRows = [];
						this.isActionsButtonVisible = false;
						Notification(this.$t("Beneficiaries Successfully Added to a Project"), "success");
						this.fetchData();
					})
					.catch((e) => {
						Notification(`${this.$t("Beneficiaries")} ${e.message || e}`, "error");
					});

				this.closeAddToProjectModal();
				this.table.checkedRows = [];
				this.confirmButtonLoading = false;
				this.onRowsChecked();
			}
		},

		async fetchProjects() {
			this.isLoading.projects = true;

			try {
				const { data: { data } } = await ProjectService.getShortListOfProjects();

				this.options.projects = data;
				this.isLoading.projects = false;
			} catch (e) {
				Notification(`${this.$t("Projects")} ${e.message || e}`, "error");
			}
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
				const { id } = item;
				const { typeOfLocation, addressId } = this.getAddressTypeAndId(item);

				projectIds.push(...item.projectIds);
				beneficiaryIds.push(item.householdHeadId);

				this.table.data[key] = item;
				this.table.data[key].householdId = id;
				this.table.data[key].id = {
					routeParams: { householdId: id },
					routeName: "HouseholdInformationSummary",
					name: id,
				};
				this.table.data[key].addressId = addressId;
				this.table.data[key].members = item.beneficiaryIds.length;

				// TODO Fix bug with Informal Settlement (Location Type)
				if (typeOfLocation && addressId) {
					addressIds[typeOfLocation].push(addressId);
				}
			});

			this.prepareProjectForTable([...new Set(projectIds)]);

			this.prepareBeneficiaryForTable([...new Set(beneficiaryIds)]);

			this.prepareAddressForTable(addressIds);

			this.table.progress = 100;
		},

		async prepareBeneficiaryForTable(beneficiaryIds) {
			const beneficiaries = await this.getBeneficiaries(beneficiaryIds);
			const vulnerabilitiesList = await this.getVulnerabilities();

			this.table.progress += 10;
			const allNationalIdIds = [];
			await this.table.data.forEach(async (item, key) => {
				const {
					nationalIds,
				} = await this.prepareBeneficiaries(
					item.householdId,
					item.householdHeadId,
					beneficiaries,
					key,
				);
				const vulnerabilities = this.table.data[key].vulnerabilities || [];
				this.table.data[key].vulnerabilities = vulnerabilitiesList?.filter(
					({ code }) => code === vulnerabilities.find(
						(vulnerability) => vulnerability === code,
					),
				);
				this.table.data[key].nationalIds = nationalIds;
				this.table.data[key].supportDateReceived = item.supportDateReceived
					? new Date(item.supportDateReceived)
					: null;
				allNationalIdIds.push(...nationalIds);
			});
			this.table.progress += 5;
			this.getNationalIds(allNationalIdIds)
				.then((nationalIdResult) => {
					this.table.progress += 5;
					this.table.data.forEach((item, key) => {
						let idsText = "";
						if (item.nationalIds) {
							item.nationalIds.forEach((nationalId, index) => {
								if (index !== 0) {
									idsText += "<br />";
								}
								const idEntity = nationalIdResult.find((idItem) => idItem.id === nationalId);
								if (idEntity) {
									idsText += `${idEntity.type}: <b>${idEntity.number}</b>`;
								}
							});
						}
						this.table.data[key].idNumbers = idsText || this.$t("None");
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

		async getVulnerabilities() {
			return BeneficiariesService.getListOfVulnerabilities()
				.then(({ data }) => data)
				.catch((e) => {
					Notification(`${this.$t("Vulnerabilities")} ${e.message || e}`, "error");
				});
		},

		async getNationalIds(ids) {
			return BeneficiariesService.getNationalIds(ids)
				.then(({ data }) => data).catch((e) => {
					Notification(`${this.$t("National IDs")} ${e.message || e}`, "error");
				});
		},

		// Replaces method from addressHelper
		async getAddresses(ids) {
			const addresses = [];
			if (ids.camp.length) {
				let camps = [];
				await AddressService.getCampAddresses(ids.camp)
					.then(({ data }) => {
						camps = data;
					}).catch((e) => {
						Notification(`${this.$t("Camp Address")} ${e.message || e}`, "error");
					});
				const uniqueCampIds = getUniqueIds(camps, "campId");

				await AddressService.getCampsByIds(uniqueCampIds)
					.then(({ data }) => {
						data.forEach((item) => {
							const address = camps.find(({ campId }) => campId === item.id);
							if (address) {
								addresses.push({
									locationId: item.locationId,
									id: address.id,
									type: "camp",
								});
							}
						});
					}).catch((e) => {
						Notification(`${this.$t("Camps")} ${e.message || e}`, "error");
					});
			}
			if (ids.residence.length) {
				await AddressService.getResidenceAddresses(ids.residence)
					.then(({ data }) => {
						data.forEach(({ locationId, id }) => {
							addresses.push({ locationId, id, type: "residence" });
						});
					}).catch((e) => {
						Notification(`${this.$t("Residency Address")} ${e.message || e}`, "error");
					});
			}
			if (ids.temporary_settlement.length) {
				await AddressService.getTemporarySettlementAddresses(ids.temporary_settlement)
					.then(({ data }) => {
						data.forEach(({ locationId, id }) => {
							addresses.push({ locationId, id, type: "temporary_settlement" });
						});
					}).catch((e) => {
						Notification(`${this.$t("Temporary Settlement Address")} ${e.message || e}`, "error");
					});
			}
			return addresses;
		},

		async getProjects(ids) {
			try {
				const { data: { data } } = await ProjectService.getShortListOfProjects(ids);
				return data;
			} catch (e) {
				Notification(`${this.$t("Projects")} ${e.message || e}`, "error");
			}

			return [];
		},

		async getBeneficiaries(ids) {
			return BeneficiariesService.getBeneficiaries(ids)
				.then(({ data }) => data)
				.catch((e) => {
					Notification(`${this.$t("Beneficiaries")} ${e.message || e}`, "error");
				});
		},

		async prepareBeneficiaries(id, householdHeadId, beneficiaries, tableIndex) {
			if (!beneficiaries?.length) return "";
			this.table.data[tableIndex].loading = true;
			const result = {
				nationalIds: [],
			};
			const beneficiary = beneficiaries.find((item) => item.id === householdHeadId);
			const { nationalIds } = beneficiary;

			if (beneficiary) {
				this.table.data[tableIndex].givenName = this.prepareName(
					beneficiary.localGivenName,
					beneficiary.enGivenName,
				);
				this.table.data[tableIndex].familyName = this.prepareName(
					beneficiary.localFamilyName,
					beneficiary.enFamilyName,
				);
				result.nationalIds = nationalIds;
			}

			this.table.data[tableIndex].loading = false;
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

		normalizeText(text) {
			return normalizeText(text);
		},

		advancedSearchToggle() {
			this.visiblePanels = this.isAdvancedSearchVisible ? [] : ["advancedSearch"];
		},

		bulkSearchToggle() {
			this.visiblePanels = this.isBulkSearchVisible ? [] : ["bulkSearch"];
		},

		async removeMultipleHouseholds() {
			await this.removeHousehold(null, true);
			this.isActionsButtonVisible = false;
			await this.fetchData();
			this.onRowsChecked();
		},

		saveDeleteOfMultipleHouseholds() {
			// FIXME
			this.$buefy.dialog.confirm({
				title: this.$t("Deleting"),
				message: this.$t("Are you sure you want to delete this Households?"),
				confirmText: this.$t("Delete"),
				cancelText: this.$t("Cancel"),
				type: "error",
				hasIcon: true,
				onConfirm: () => {
					this.removeMultipleHouseholds();
				},
			});
		},

		async removeHousehold(id, multiple = false) {
			if (multiple) {
				const { checkedRows } = this.table;
				let error = "";
				let success = "";

				if (checkedRows?.length) {
					await Promise.all(checkedRows.map(async (household) => {
						await BeneficiariesService.removeHousehold(household.householdId).then((response) => {
							if (response.status === 204) {
								success += `${this.$t("Success for Household")} ${household.householdId}. `;
							}
						}).catch((e) => {
							error += `${this.$t("Error for Household")} ${household.householdId} ${e.message || e}. `;
						});
					}));

					if (error) Notification(error, "error");
					if (success) Notification(success, "success");
				}
			} else {
				await BeneficiariesService.removeHousehold(id).then((response) => {
					if (response.status === 204) {
						Notification(this.$t("Household Successfully Deleted"), "success");
						this.fetchData();
					}
				}).catch((e) => {
					Notification(`${this.$t("Household")} ${e.message || e}`, "error");
				});
			}

			this.table.checkedRows = [];
		},

		closeHouseholdDetailModal() {
			this.householdDetailModal.isOpened = false;
		},

		showHouseholdDetail(id) {
			this.mapHouseholdDetail(this.table.data.find((item) => item.householdId === id));
			this.householdDetailModal.isOpened = true;
		},

		closeAddToProjectModal() {
			this.addToProjectModal.isOpened = false;
		},

		showAddToProjectModal() {
			this.fetchProjects();
			this.addToProjectModal.isOpened = true;
		},

		mapHouseholdDetail(household) {
			this.householdModel = {
				...household,
			};
		},

		onResetFilters() {
			this.resetSearch({
				tableRef: "households",
				filtersRef: "householdsFilter",
				bulkSearchRef: "bulkSearch",
			});

			this.$refs.households.resetSearch();
		},
	},
};
</script>
