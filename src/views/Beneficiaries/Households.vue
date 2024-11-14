<template>
	<v-container fluid>
		<ConfirmAction
			:is-dialog-opened="removeHouseholdModal.isOpened"
			confirm-title="Deleting"
			confirm-message="Are you sure you want to delete this Households?"
			prepend-icon="circle-exclamation"
			prepend-icon-color="red"
			close-button-name="Cancel"
			confirm-button-name="Delete"
			confirm-button-color="red"
			@actionConfirmed="removeMultipleHouseholds"
			@modalClosed="removeHouseholdModal.isOpened = false"
		/>

		<div class="d-flex mb-4">
			<h2 class="me-auto" data-cy="page-title-text">{{ $t('Households') }}</h2>

			<v-menu>
				<template v-slot:activator="{ props }">
					<v-btn
						v-bind="props"
						:disabled="!isUserPermissionGranted(PERMISSIONS.HOUSEHOLD_CREATE)"
						:data-cy="identifierBuilder('add-beneficiary-button')"
						color="primary"
						prepend-icon="plus"
						class="text-none ml-0"
					>
						{{ $t('Create') }}
					</v-btn>
				</template>

				<v-list>
					<router-link :to="{ name: ROUTER.ROUTE_NAME.IMPORTS.ROOT, query: { openModal: '1' } }">
						<v-list-item>
							<v-card
								:title="$t('Import')"
								:subtitle="$t('Import from File')"
								:data-cy="identifierBuilder('import-from-file-button')"
								density="compact"
							>
								<template v-slot:prepend>
									<v-icon icon="upload" size="small" />
								</template>
							</v-card>
						</v-list-item>
					</router-link>

					<router-link :to="{ name: ROUTER.ROUTE_NAME.HOUSEHOLDS.ADD }">
						<v-list-item>
							<v-card
								:title="$t('Add Beneficiary')"
								:subtitle="$t('Create household form')"
								:data-cy="identifierBuilder('add-beneficiary-button')"
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
				@actionConfirmed="onAddHouseholdsToProject"
				@formClosed="addToProjectModal.isOpened = false"
			/>
		</Modal>

		<Modal
			v-model="householdDetailModal.isOpened"
			header="Household Detail"
			data-cy="detail-modal"
		>
			<HouseholdDetail
				:household-model="householdModel"
				data-cy="detail-modal"
				@formClosed="householdDetailModal.isOpened = false"
			/>
		</Modal>

		<DataGrid
			ref="households"
			v-model="table.checkedRows"
			v-model:page="table.currentPage"
			v-model:sort-by="sortValue"
			:items-per-page="perPage"
			:headers="table.columns"
			:items="table.data"
			:total-count="table.total"
			:loading="isLoading.households"
			:progress="table.progress"
			:search-phrase="table.searchPhrase"
			:selected-rows="table.checkedRows.length"
			:is-search-disabled="isBulkSearchVisible"
			:data-cy="prepareComponentIdentifier('households-table')"
			reset-filters-button
			reset-sort-button
			is-search-visible
			is-row-click-disabled
			show-select
			@update:sortBy="onSort"
			@search="onSearch"
			@pageChanged="onPageChange"
			@perPageChanged="onPerPageChange"
			@resetFilters="onResetFilters"
			@resetSort="onResetSort(TABLE.DEFAULT_SORT_OPTIONS.HOUSEHOLDS)"
		>
			<template v-slot:actions="{ row: { householdId }, index }">
				<ButtonAction
					:required-permissions="PERMISSIONS.HOUSEHOLD_VIEW"
					:disabled="!householdsSelects"
					:data-cy="`table-row-${index + 1}-show-detail-button`"
					icon="search"
					label="Show Detail"
					tooltip-text="Detail"
					@actionConfirmed="onShowHouseholdDetail(householdId)"
				/>

				<ButtonAction
					:required-permissions="PERMISSIONS.HOUSEHOLD_EDIT"
					:disabled="!householdsSelects"
					:data-cy="`table-row-${index + 1}-edit-button`"
					icon="edit"
					label="Edit"
					tooltip-text="Edit"
					@actionConfirmed="$router.push(getHouseholdEditPage(householdId))"
				/>

				<ButtonAction
					:required-permissions="PERMISSIONS.HOUSEHOLD_DELETE"
					:disabled="!householdsSelects"
					:data-cy="`table-row-${index + 1}-delete-button`"
					icon="trash"
					label="Delete"
					tooltip-text="Delete"
					icon-color="red"
					confirm-title="Deleting Household"
					confirm-message="Are you sure you want to delete Household?"
					prepend-icon="circle-exclamation"
					prepend-icon-color="red"
					is-confirm-action
					@actionConfirmed="onRemoveHousehold(householdId)"
				/>
			</template>

			<template v-slot:tableControls>
				<ExportControl
					:required-permissions="PERMISSIONS.HOUSEHOLD_EXPORT"
					:disabled="!table.data.length || !table.dataUpdated"
					:available-export-formats="exportControl.formats"
					:available-export-types="exportControl.types"
					:is-export-loading="exportControl.loading"
					:location="exportControl.location"
					@export="onExportHouseholds"
				/>

				<v-btn
					:append-icon="isAdvancedSearchVisible ? 'arrow-up' : 'arrow-down'"
					:data-cy="identifierBuilder('advanced-search-button')"
					color="blue-grey-lighten-4"
					variant="elevated"
					class="ml-4 text-none"
					@click="onAdvancedSearchToggle"
				>
					{{ $t('Advanced Search') }}
				</v-btn>

				<v-btn
					:append-icon="isBulkSearchVisible ? 'arrow-up' : 'arrow-down'"
					:data-cy="identifierBuilder('bulk-search-button')"
					color="blue-grey-lighten-4"
					variant="elevated"
					class="ml-4 text-none"
					@click="onBulkSearchToggle"
				>
					{{ $t('Bulk Search') }}
				</v-btn>

				<v-menu v-if="isActionsButtonVisible">
					<template v-slot:activator="{ props }">
						<v-btn
							v-bind="props"
							:append-icon="props.open ? 'arrow-up' : 'arrow-down'"
							color="primary"
							class="ml-4 text-none"
						>
							{{ $t('Actions') }}
						</v-btn>
					</template>

					<v-list>
						<v-list-item
							:disabled="!isUserPermissionGranted(PERMISSIONS.HOUSEHOLD_EDIT)"
							@click="onShowAddToProjectModal"
						>
							<v-icon class="mr-1" icon="plus" />
							{{ $t('Add to Project') }}
						</v-list-item>

						<v-list-item
							:disabled="!isUserPermissionGranted(PERMISSIONS.HOUSEHOLD_DELETE)"
							@click="removeHouseholdModal.isOpened = true"
						>
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
								@search="onClickedSearch"
							/>
						</v-expansion-panel-text>
					</v-expansion-panel>
					<v-expansion-panel value="bulkSearch" class="mt-0" eager>
						<v-expansion-panel-text>
							<BulkSearch
								ref="bulkSearch"
								@clickedBulkSearch="onClickedBulkSearch"
								@bulkSearchChanged="onBulkSearchChanged"
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
import BeneficiariesService from "@/services/BeneficiariesService";
import ProjectService from "@/services/ProjectService";
import AddProjectToHousehold from "@/components/Beneficiaries/Household/AddProjectToHousehold";
import HouseholdDetail from "@/components/Beneficiaries/Household/HouseholdDetail";
import ButtonAction from "@/components/ButtonAction";
import ConfirmAction from "@/components/ConfirmAction";
import DataGrid from "@/components/DataGrid";
import ExportControl from "@/components/Inputs/ExportControl";
import Modal from "@/components/Inputs/Modal";
import addressHelper from "@/mixins/addressHelper";
import grid from "@/mixins/grid";
import identifierBuilder from "@/mixins/identifierBuilder";
import permissions from "@/mixins/permissions";
import routerHelper from "@/mixins/routerHelper";
import urlFiltersHelper from "@/mixins/urlFiltersHelper";
import validation from "@/mixins/validation";
import { generateColumns, normalizeExportDate, normalizeText } from "@/utils/datagrid";
import { checkResponseStatus } from "@/utils/fetcher";
import { downloadFile } from "@/utils/helpers";
import { Notification } from "@/utils/UI";
import { EXPORT, PERMISSIONS, ROUTER, TABLE } from "@/consts";

export default {
	name: "HouseholdPage",

	components: {
		AddProjectToHousehold,
		BulkSearch: defineAsyncComponent(() => import("@/components/Beneficiaries/Household/BulkSearch")),
		ButtonAction,
		ConfirmAction,
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
		identifierBuilder,
		routerHelper,
	],

	data() {
		return {
			ROUTER,
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
					{
						key: "id",
						title: "Household ID",
						type: "link",
						permissionsForLinkVisibility: [
							PERMISSIONS.HOUSEHOLD_VIEW,
							PERMISSIONS.TRANSACTIONS,
						],
						sortable: false,
					},
					{ key: "familyName", title: "Local family name", sortKey: "localFamilyName" },
					{ key: "givenName", title: "Local given name", sortKey: "localFirstName" },
					{ key: "members", sortKey: "dependents" },
					{ key: "vulnerabilities", title: "Vulnerability criteria", type: "svgIcon" },
					{ key: "idNumbers", title: "ID Numbers", sortKey: "nationalId" },
					{ key: "projects", title: "Projects", sortable: false },
					{
						key: "currentLocation",
						title: "Current Location",
						sortKey: "currentHouseholdLocation",
						sortable: false,
					},
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
			removeHouseholdModal: {
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
			dataCy: "",
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
			try {
				const sort = this.table.sortColumn !== ""
					? `${this.table.sortColumn?.sortKey || this.table.sortColumn}.${this.table.sortDirection}`
					: "";

				const {
					data: { data, totalCount },
					status,
					message,
				} = await BeneficiariesService.getListOfHouseholds({
					page: this.table.currentPage,
					size: this.perPage,
					search: this.table.searchPhrase,
					filters: this.filters,
					sort,
				});

				this.table.data = [];
				this.table.progress = 0;

				checkResponseStatus(status, message);

				this.table.total = totalCount;
				this.table.dataUpdated = true;

				if (data.length > 0) {
					await this.prepareDataForTable(data);
				}
			} catch (e) {
				Notification(`${this.$t("Households")}: ${e.message || e}`, "error");
			} finally {
				this.isLoading.households = false;
			}
		},

		async fetchBulkSearchData() {
			try {
				const sort = this.table.sortColumn !== ""
					? `${this.table.sortColumn?.sortKey || this.table.sortColumn}.${this.table.sortDirection}`
					: "";

				const {
					data: { result: { data, totalCount }, notFoundIds },
					status,
					message,
				} = await BeneficiariesService
					.getListOfHouseholdByBulkSearch({
						page: this.table.currentPage,
						size: this.perPage,
						body: {
							searchBy: this.bulkSearch.searchBy,
							searchIds: this.arrayIds,
						},
						sort,
					});

				this.table.data = [];
				this.table.progress = 0;

				checkResponseStatus(status, message);

				this.table.total = totalCount;
				this.table.dataUpdated = true;
				this.bulkSearch.notFoundIds = notFoundIds.join(" ");
				this.bulkSearch.isBulkSearchUsed = true;

				if (data.length > 0) {
					await this.prepareDataForTable(data);
				}
			} catch (e) {
				Notification(`${this.$t("Bulk Search")}: ${e.message || e}`, "error");
			} finally {
				this.isLoading.households = false;
			}
		},

		async onExportHouseholds(exportType, format) {
			if (exportType === EXPORT.HOUSEHOLDS) {
				let ids = [];
				const filename = `BNF Households ${normalizeExportDate()}`;

				if (!this.householdsSelects) {
					ids = this.table.checkedRows.map(
						(household) => household.routeParams.householdId,
					);
				}

				if (this.bulkSearch.isBulkSearchUsed) {
					try {
						this.exportControl.loading = true;

						const body = {
							searchBy: this.bulkSearch.searchBy,
							searchIds: this.bulkSearch.ids.split(" "),
						};
						const {
							data,
							status,
							message,
						} = await BeneficiariesService.exportBulkSearchHouseholds({
							format,
							ids,
							body,
						});

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
						this.exportControl.loading = true;

						const sort = `${this.table.sortColumn?.sortKey
							|| this.table.sortColumn}.${this.table.sortDirection}`;
						const filters = {
							...this.filters,
							...(this.table.searchPhrase && { fulltext: this.table.searchPhrase }),
						};
						const {
							data,
							status,
							message,
						} = await BeneficiariesService.exportHouseholds({
							format,
							ids,
							filters,
							sort,
						});

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

		onClickedBulkSearch(bulkSearchData) {
			this.table.checkedRows = [];
			this.bulkSearch = bulkSearchData;
			this.fetchData();
		},

		onBulkSearchChanged() {
			this.table.dataUpdated = false;
		},

		onClickedSearch() {
			this.table.checkedRows = [];
			this.bulkSearch.isBulkSearchUsed = false;
			this.onSearch(this.table.searchPhrase);
		},

		async onAddHouseholdsToProject(project) {
			this.selectedProject = project;
			this.confirmButtonLoading = true;

			if (this.table.checkedRows?.length && this.selectedProject) {
				const householdsIds = this.table.checkedRows.map(
					(household) => household.routeParams.householdId,
				);

				try {
					const {
						status,
						message,
					} = await BeneficiariesService.addHouseholdsToProject({
						projectId: this.selectedProject.id,
						ids: householdsIds,
					});

					checkResponseStatus(status, message, 204);

					this.table.checkedRows = [];
					this.isActionsButtonVisible = false;

					Notification(this.$t("Beneficiaries Successfully Added to a Project"), "success");
					await this.fetchData();
				} catch (e) {
					Notification(`${this.$t("Beneficiaries")}: ${e.message || e}`, "error");
				}

				this.addToProjectModal.isOpened = false;
				this.table.checkedRows = [];
				this.confirmButtonLoading = false;
				this.onRowsChecked();
			}
		},

		async fetchProjects() {
			this.isLoading.projects = true;

			try {
				const {
					data: { data },
					status,
					message,
				} = await ProjectService.getShortListOfProjects();

				checkResponseStatus(status, message);

				this.options.projects = data;
			} catch (e) {
				Notification(`${this.$t("Projects")}: ${e.message || e}`, "error");
			} finally {
				this.isLoading.projects = false;
			}
		},

		async prepareDataForTable(data) {
			const vulnerabilitiesCriteriaList = await this.getVulnerabilities();

			data.forEach((item, key) => {
				const { id } = item;
				const address = this.getAddressTypeAndId(item);
				const householdHead = item.beneficiaries.find(
					(beneficiary) => beneficiary.id === item.householdHeadId,
				);
				const preparedVulnerabilitiesCriteria = householdHead.vulnerabilityCriteria
					? vulnerabilitiesCriteriaList?.filter(
						({ code }) => householdHead.vulnerabilityCriteria.includes(code),
					)
					: null;

				this.table.data[key] = {
					...item,
					projects: item.projects.map((project) => project.name).join(", "),
					vulnerabilities: preparedVulnerabilitiesCriteria,
					supportDateReceived: householdHead.supportDateReceived
						? new Date(householdHead.supportDateReceived)
						: null,
					householdId: id,
					address,
					members: item.beneficiaries.length,
					currentLocation: address?.locationName || address?.name,
					idNumbers: this.prepareIdNumbers(householdHead.nationalIds),
					familyName: this.prepareName(
						householdHead.localFamilyName,
						householdHead.enFamilyName,
					),
					givenName: this.prepareName(
						householdHead.localGivenName,
						householdHead.enGivenName,
					),
					id: {
						routeParams: { householdId: id },
						routeName: ROUTER.ROUTE_NAME.HOUSEHOLD_INFORMATION_SUMMARY,
						name: id,
					},
				};
			});
		},

		prepareIdNumbers(nationalIds) {
			let idsText = "";

			if (nationalIds) {
				nationalIds.forEach((nationalId, index) => {
					if (index !== 0) {
						idsText += "<br />";
					}

					if (nationalId) {
						idsText += `${nationalId.type}: <b>${nationalId.number}</b>`;
					}
				});
			}

			return idsText || this.$t("None");
		},

		async getVulnerabilities() {
			try {
				const {
					data: { data },
					status,
					message,
				} = await BeneficiariesService.getListOfVulnerabilities();

				checkResponseStatus(status, message);

				return data;
			} catch (e) {
				Notification(`${this.$t("Vulnerabilities")}: ${e.message || e}`, "error");
			}

			return [];
		},

		normalizeText(text) {
			return normalizeText(text);
		},

		onAdvancedSearchToggle() {
			this.visiblePanels = this.isAdvancedSearchVisible ? [] : ["advancedSearch"];
		},

		onBulkSearchToggle() {
			this.visiblePanels = this.isBulkSearchVisible ? [] : ["bulkSearch"];
		},

		async removeMultipleHouseholds() {
			this.removeHouseholdModal.isOpened = false;
			await this.onRemoveHousehold(null, true);
			this.isActionsButtonVisible = false;
			await this.fetchData();
			this.onRowsChecked();
		},

		async onRemoveHousehold(id, multiple = false) {
			if (multiple) {
				const { checkedRows } = this.table;
				let error = "";
				let success = "";

				if (checkedRows?.length) {
					await Promise.all(checkedRows.map(async (household) => {
						const { householdId } = household.routeParams;

						try {
							const {
								status,
								message,
							} = await BeneficiariesService.removeHousehold(householdId);

							checkResponseStatus(status, message, 204);

							success += `${this.$t("Success for Household")} ${householdId}. `;
						} catch (e) {
							error += `${this.$t("Error for Household")}: ${householdId} ${e.message || e}. `;
						}
					}));

					if (error) Notification(error, "error");
					if (success) Notification(success, "success");
				}
			} else {
				try {
					const {
						status,
						message,
					} = await BeneficiariesService.removeHousehold(id);

					checkResponseStatus(status, message, 204);

					Notification(this.$t("Household Successfully Deleted"), "success");
					await this.fetchData();
				} catch (e) {
					Notification(`${this.$t("Household")}> ${e.message || e}`, "error");
				}
			}

			this.table.checkedRows = [];
		},

		onShowHouseholdDetail(id) {
			this.mapHouseholdDetail(this.table.data.find((item) => item.householdId === id));
			this.householdDetailModal.isOpened = true;
		},

		onShowAddToProjectModal() {
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
