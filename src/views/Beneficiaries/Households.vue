<template>
	<div>
		<div class="level">
			<div class="level-left">
				<h1 class="title">{{ $t('Households') }}</h1>
			</div>

			<div class="level-right">
				<b-dropdown position="is-bottom-left">
					<b-button
						v-if="userCan.addBeneficiary"
						type="is-primary"
						icon-left="plus"
						slot="trigger"
					>
						{{ $t('Create') }}
					</b-button>
					<b-dropdown-item
						v-if="userCan.importBeneficiaries"
						:value="false"
						@click="goToImportPage"
					>
						<div class="media">
							<b-icon class="media-left" icon="upload" />
							<div class="media-content">
								<h2>{{ $t('Import') }}</h2>
								<small>{{ $t('Import from File') }}</small>
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
								<h2>{{ $t('Add Beneficiary') }}</h2>
								<small>{{ $t('Create household form') }}</small>
							</div>
						</div>
					</b-dropdown-item>
				</b-dropdown>
			</div>
		</div>
		<Modal
			can-cancel
			:header="$t('Add Beneficiary to a Project')"
			:active="addToProjectModal.isOpened"
			@close="closeAddToProjectModal"
		>
			<section class="modal-card-body overflow-visible">
				<b-field label="Projects">
					<MultiSelect
						v-model="selectedProject"
						searchable
						label="name"
						track-by="id"
						:placeholder="$t('Click to select')"
						:loading="loading.projects"
						:options="options.projects"
					/>
				</b-field>
			</section>
			<footer class="modal-card-foot">
				<b-button  @click="closeAddToProjectModal">
					{{ $t('Close') }}
				</b-button>
				<b-button
					type="is-primary"
					:loading="confirmButtonLoading"
					@click="addHouseholdsToProject"
				>
					{{ $t('Confirm') }}
				</b-button>
			</footer>
		</Modal>

		<Modal
			can-cancel
			:header="$t('Household Detail')"
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
			:checked-rows="table.checkedRows"
			@checked="onRowsChecked"
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
				width="150"
				centered
				:label="$t('Actions')"
			>
				<div class="buttons is-right">
					<ActionButton
						v-if="userCan.viewBeneficiary"
						icon="search"
						type="is-primary"
						:tooltip="$t('Show Detail')"
						@click.native="showDetail(props.row.id)"
					/>
					<ActionButton
						v-if="userCan.viewBeneficiary"
						icon="edit"
						:tooltip="$t('Edit')"
						@click.native="editHousehold(props.row.id)"
					/>
					<SafeDelete
						v-if="userCan.deleteBeneficiary"
						icon="trash"
						:entity="$t('Household')"
						:tooltip="$t('Delete')"
						:id="props.row.id"
						@submitted="removeHousehold"
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

			<template v-if="actionsButtonVisible" #actions>
				<div class="column">
					<b-dropdown aria-role="list">
						<template #trigger>
							<b-button
								type="is-primary"
								icon-right="arrow-down"
								:label="$t('Actions')"
							/>
						</template>
						<b-dropdown-item @click="showAddToProjectModal">
							<b-icon class="mr-1" icon="plus" />
							{{ $t('Add to Project') }}
						</b-dropdown-item>
						<b-dropdown-item @click="saveDeleteOfMultipleHouseholds">
							<b-icon class="mr-1" icon="trash" />
							{{ $t('Delete') }}
						</b-dropdown-item>
					</b-dropdown>
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
import ProjectService from "@/services/ProjectService";
import AddressService from "@/services/AddressService";
import { Notification, Toast } from "@/utils/UI";
import { generateColumns, normalizeText } from "@/utils/datagrid";
import grid from "@/mixins/grid";
import addressHelper from "@/mixins/addressHelper";
import HouseholdDetail from "@/components/Beneficiaries/Household/HouseholdDetail";
import permissions from "@/mixins/permissions";

const HouseholdsFilters = () => import("@/components/Beneficiaries/HouseholdsFilters");

export default {
	name: "HouseholdPage",

	components: {
		HouseholdDetail,
		Table,
		ActionButton,
		HouseholdsFilters,
		SafeDelete,
		ColumnField,
		Modal,
	},

	mixins: [grid, addressHelper, permissions],

	data() {
		return {
			exportLoading: false,
			advancedSearchVisible: false,
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{ key: "id", label: "Household ID", width: "30" },
					{ key: "familyName", label: "Family Name", width: "30", sortKey: "localFamilyName" },
					{ key: "givenName", label: "First Name", width: "30", sortKey: "localFirstName" },
					{ key: "members", width: "30", sortKey: "dependents" },
					{ key: "vulnerabilities", type: "svgIcon", width: "30" },
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
				checkedRows: [],
			},
			filters: {},
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
			actionsButtonVisible: false,
			confirmButtonLoading: false,
			selectedProject: null,
			loading: {
				projects: false,
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
				Notification(`${this.$t("Households")} ${e}`, "is-danger");
			});
		},

		onRowsChecked(rows) {
			this.table.checkedRows = rows;
			this.actionsButtonVisible = !!rows?.length;
		},

		async addHouseholdsToProject() {
			this.confirmButtonLoading = true;

			if (this.table.checkedRows?.length && this.selectedProject) {
				const householdsIds = this.table.checkedRows.map((household) => household.id);

				await BeneficiariesService
					.addHouseholdsToProject(this.selectedProject.id, householdsIds)
					.then(() => {
						this.table.checkedRows = [];
						this.actionsButtonVisible = false;
						Toast(this.$t("Beneficiaries Successfully Added to a Project"), "is-success");
						this.fetchData();
					})
					.catch((e) => {
						Notification(`${this.$t("Beneficiaries")} ${e}`, "is-danger");
					});

				this.closeAddToProjectModal();
				this.confirmButtonLoading = false;
			}
		},

		async fetchProjects() {
			this.loading.projects = true;

			await ProjectService.getListOfProjects()
				.then(({ data }) => {
					this.options.projects = data;
				})
				.catch((e) => {
					Notification(`${this.$t("Projects")} ${e}`, "is-danger");
				});

			this.loading.projects = false;
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
				this.table.data[key].supportDateReceived = new Date(item.supportDateReceived);
				nationalIdIds.push(nationalId);
			});
			this.table.progress += 5;
			this.getNationalIds(nationalIdIds)
				.then((nationalIdResult) => {
					this.table.progress += 5;
					this.table.data.forEach((item, key) => {
						this.table.data[key]
							.idNumber = this.prepareEntityForTable(item.nationalId, nationalIdResult, "number", "None");
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
					Notification(`${this.$t("National IDs")} ${e}`, "is-danger");
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
						Notification(`${this.$t("Camp Address")} ${e}`, "is-danger");
					});
			}
			if (ids.residence.length) {
				await AddressService.getResidenceAddresses(ids.residence)
					.then(({ data }) => {
						data.forEach(({ locationId, id }) => {
							addresses.push({ locationId, id, type: "residence" });
						});
					}).catch((e) => {
						Notification(`${this.$t("Residency Address")} ${e}`, "is-danger");
					});
			}
			if (ids.temporary_settlement.length) {
				await AddressService.getTemporarySettlementAddresses(ids.temporary_settlement)
					.then(({ data }) => {
						data.forEach(({ locationId, id }) => {
							addresses.push({ locationId, id, type: "temporary_settlement" });
						});
					}).catch((e) => {
						Notification(
							`${this.$t("Temporary Settlement Address")} ${e}`,
							"is-danger",
						);
					});
			}
			return addresses;
		},

		async getProjects(ids) {
			return ProjectService.getListOfProjects(null, null, null, null, ids)
				.then(({ data }) => data)
				.catch((e) => {
					Notification(`${this.$t("Projects")} ${e}`, "is-danger");
				});
		},

		async getBeneficiaries(ids) {
			return BeneficiariesService.getBeneficiaries(ids)
				.then(({ data }) => data)
				.catch((e) => {
					Notification(`${this.$t("Beneficiaries")} ${e}`, "is-danger");
				});
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
				result.vulnerabilities = beneficiary.vulnerabilityCriteria;
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

		goToSummaryDetail({ id }) {
			this.$router.push({ name: "HouseholdInformationSummary", params: { householdId: id } });
		},

		editHousehold(id) {
			this.$router.push({ name: "EditHousehold", params: { householdId: id } });
		},

		async removeMultipleHouseholds() {
			await this.removeHousehold(null, true);
			this.actionsButtonVisible = false;
			await this.fetchData();
		},

		saveDeleteOfMultipleHouseholds() {
			this.$buefy.dialog.confirm({
				title: this.$t("Deleting"),
				message: this.$t("Are you sure you want to delete this Households?"),
				confirmText: this.$t("Delete"),
				type: "is-danger",
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
						await BeneficiariesService.removeHousehold(household.id).then((response) => {
							if (response.status === 204) {
								success += `${this.$t("Success for Household")} ${household.id}. `;
							}
						}).catch((e) => {
							error += `${this.$t("Error for Household")} ${household.id} ${e}. `;
						});
					}));

					if (error) Toast(error, "is-danger");
					if (success) Toast(success, "is-success");
				}
			} else {
				await BeneficiariesService.removeHousehold(id).then((response) => {
					if (response.status === 204) {
						Toast(this.$t("Household Successfully Deleted"), "is-success");
						this.fetchData();
					}
				}).catch((e) => {
					Toast(`${this.$t("Household")} ${e}`, "is-danger");
				});
			}
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
	},
};
</script>
