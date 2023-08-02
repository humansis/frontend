<template>
	<div>
		<Modal
			can-cancel
			:header="addBeneficiaryModel.removingId ?
				$t('Remove Beneficiary From This Assistance')
				: $t('Add Beneficiaries to This Assistance')
			"
			:active="addBeneficiaryModal.isOpened"
			@close="closeAddBeneficiaryModal"
		>
			<AddBeneficiaryForm
				close-button
				:submit-button-label="$t('Confirm')"
				:formModel="addBeneficiaryModel"
				:assistance="assistance"
				@addingOrRemovingSubmitted="addedOrRemovedBeneficiary"
				@formClosed="closeAddBeneficiaryModal"
			/>
		</Modal>
		<Modal
			can-cancel
			:header="$t('Assign Booklet to a Beneficiary')"
			:active="assignVoucherModal.isOpened"
			:is-waiting="assignVoucherModal.isWaiting"
			@close="closeAssignVoucherModal"
		>
			<AssignVoucherForm
				close-button
				:submit-button-label="$t('Confirm')"
				:beneficiary="assignVoucherToBeneficiaryId"
				:assistance="assistance"
				:project="project"
				@scannedCode="assignBookletToBeneficiary"
				@formClosed="closeAssignVoucherModal"
			/>
		</Modal>
		<Modal
			can-cancel
			:header="beneficiaryModal.isEditing ? $t('Edit This Beneficiary')
				: $t('Detail of Beneficiary')"
			:active="beneficiaryModal.isOpened"
			:is-waiting="beneficiaryModal.isWaiting"
			@close="closeBeneficiaryModal"
		>
			<EditBeneficiaryForm
				close-button
				:submit-button-label="$t('Save')"
				class="modal-card"
				:disabled="!beneficiaryModal.isEditing"
				:formModel="beneficiaryModel"
				@formSubmitted="submitEditBeneficiaryForm"
				@formClosed="closeBeneficiaryModal"
			/>
		</Modal>
		<Modal
			can-cancel
			:header="institutionModal.isEditing ? $t('Edit This Institution')
				: $t('Detail of Institution')"
			:active="institutionModal.isOpened"
			:is-waiting="institutionModal.isWaiting"
			@close="closeInstitutionModal"
		>
			<EditInstitutionForm
				close-button
				:submit-button-label="$t('Save')"
				class="modal-card"
				:disabled="!institutionModal.isEditing"
				:formModel="institutionModel"
				@formSubmitted="submitEditInstitutionForm"
				@formClosed="closeInstitutionModal"
			/>
		</Modal>
		<Modal
			can-cancel
			:header="communityModal.isEditing ? $t('Edit This Community')
				: $t('Detail of Community')"
			:active="communityModal.isOpened"
			:is-waiting="communityModal.isWaiting"
			@close="closeCommunityModal"
		>
			<EditCommunityForm
				close-button
				:submit-button-label="$t('Save')"
				class="modal-card"
				:disabled="!communityModal.isEditing"
				:formModel="communityModel"
				@formSubmitted="submitEditCommunityForm"
				@formClosed="closeCommunityModal"
			/>
		</Modal>
		<Modal
			:header="$t('Add to assistance')"
			:active="addBeneficiariesByIdsModal.isOpened"
			:is-waiting="addBeneficiariesByIdsModal.isWaiting"
			@close="closeAddBeneficiariesByIdsModal"
		>
			<InputDistributed
				close-button
				adding-to-assistance
				class="modal-card"
				@submit="fetchDataAfterBeneficiaryChange"
				@close="closeAddBeneficiariesByIdsModal"
			/>
		</Modal>
		<Modal
			:header="$t('Input Deduplication')"
			:active="inputDistributedModal.isOpened"
			:is-waiting="inputDistributedModal.isWaiting"
			@close="closeInputDistributedModal"
		>
			<InputDistributed
				close-button
				deduplication
				class="modal-card"
				@submit="fetchDataAfterBeneficiaryChange"
				@close="closeInputDistributedModal"
			/>
		</Modal>
		<div class="buttons space-between align-end">
			<b-button
				v-if="isAddOrRemoveBeneficiaryAllowed"
				class="mb-4"
				type="is-primary"
				icon-left="plus"
				@click="openAddBeneficiaryModal(null, true)"
			>
				{{ $t('Add') }}
			</b-button>
			<b-button
				v-if="isAddOrRemoveBeneficiaryAllowed"
				class="mb-4"
				type="is-primary"
				icon-left="plus"
				@click="openAddBeneficiariesByIdsModal"
			>
				{{ $t('Bulk add') }}
			</b-button>
			<b-button
				v-if="isAddOrRemoveBeneficiaryAllowed"
				class="mb-4"
				type="is-primary"
				icon-left="minus"
				@click="openInputDistributedModal"
			>
				{{ $t('Bulk remove') }}
			</b-button>
			<b-field v-if="changeButton">
				<p class="control">
					<b-button rounded @click="randomSample">
						<b-icon icon="exchange-alt" />
					</b-button>
				</p>
				<b-input
					v-model="randomSampleSize"
					type="number"
					placeholder="%"
					custom-class="has-text-centered"
					min="1"
					max="100"
					icon-right="percent"
				/>
			</b-field>
		</div>
		<Table
			ref="beneficiariesList"
			has-search
			disable-prechecked-rows
			:paginated="!table.customPerPage"
			:data="table.data"
			:total="table.total"
			:current-page="table.currentPage"
			:custom-per-page="table.customPerPage"
			:is-loading="isLoadingList"
			:search-phrase="table.searchPhrase"
			:checkable="table.settings.checkableTable"
			:checked-rows="table.checkedRows"
			:row-class="(row) => row.removed && 'removed-row'"
			:search-fields="searchFields"
			:default-search-field="defaultSearchField"
			default-sort-direction="asc"
			default-sort-key="familyName"
			@clicked="showDetail"
			@pageChanged="onPageChange"
			@sorted="onSort"
			@changePerPage="onChangePerPage"
			@resetSort="resetSort('localFamilyName', 'asc')"
			@onSearch="onSearch"
			@checked="onRowsCheck"
		>
			<template v-for="column in table.columns">
				<b-table-column
					v-bind="column"
					:sortable="column.sortable"
					:key="column.id"
					v-slot="props"
				>
					<ColumnField :data="props" :column="column" />
				</b-table-column>
			</template>
			<template #resetSort>
				<div class="level-right">
					<b-button
						v-if="assistanceDetail"
						icon-left="eraser"
						class="reset-sort-button is-small mr-2"
						@click="resetFilters"
					>
						{{ $t('Reset Filters') }}
					</b-button>
					<b-button
						icon-left="eraser"
						class="reset-sort-button is-small"
						@click="resetTableSort"
					>
						{{ $t('Reset Table Sort') }}
					</b-button>
				</div>
			</template>
			<template #export>
				<ExportControl
					:disabled="isExportButtonDisabled"
					:available-export-formats="exportControl.formats"
					:available-export-types="availableExportTypes"
					:is-export-loading="exportControl.loading"
					:location="exportControl.location"
					@inputUpdated="exportValuesUpdated"
					@onExport="exportDistribution"
				/>
			</template>
			<b-table-column
				v-slot="props"
				width="140"
				field="actions"
				:visible="!!table.columns.length"
				:label="$t('Actions')"
			>
				<div class="buttons is-right">
					<ActionButton
						v-if="userCan.editDistribution"
						icon="search"
						type="is-primary"
						:tooltip="$t('View')"
						@click="showEdit(props.row)"
					/>
					<ActionButton
						v-if="userCan.editDistribution && !isAssistanceValidated"
						icon="trash"
						type="is-danger"
						:disabled="props.row.removed || isAssistanceCompleted"
						:tooltip="$t('Delete')"
						@click.native="openAddBeneficiaryModal(props.row.id, !(props.row.removed
							|| isAssistanceCompleted))"
					/>
					<ActionButton
						v-if="table.settings.assignVoucherAction
							&& userCan.assignDistributionItems"
						icon="qrcode"
						type="is-dark"
						:disabled="!props.row.canAssignVoucher"
						:tooltip="$t('Assign Voucher')"
						@click="openAssignVoucherModal(props.row.id, props.row.canAssignVoucher)"
					/>
				</div>
			</b-table-column>
			<template #progress>
				<b-progress :value="table.progress" format="percent" />
			</template>
			<template #filterButton>
				<section v-if="assistanceDetail">
					<b-button
						:class="toDistributeButtonClass"
						type="button"
						slot="trigger"
						icon-left="sticky-note"
						@click="statusFilter('toDistribute', 'To distribute')"
						@keydown.enter.prevent
					>
						{{ $t('To distribute') }}
					</b-button>
					<b-button
						:class="distributedButtonClass"
						slot="trigger"
						icon-left="sticky-note"
						@click="statusFilter('distributed')"
						@keydown.enter.prevent
					>
						{{ $t('Distributed') }}
					</b-button>
					<b-button
						:class="expiredButtonClass"
						slot="trigger"
						icon-left="sticky-note"
						@click="statusFilter('expired')"
						@keydown.enter.prevent
					>
						{{ $t('Expired') }}
					</b-button>
					<b-button
						:class="canceledButtonClass"
						slot="trigger"
						icon-left="sticky-note"
						@click="statusFilter('canceled')"
						@keydown.enter.prevent
					>
						{{ $t('Canceled') }}
					</b-button>
				</section>
			</template>
		</Table>
	</div>
</template>

<script>
import { mapState } from "vuex";
import Modal from "@/components/Modal";
import Table from "@/components/DataGrid/Table";
import ActionButton from "@/components/ActionButton";
import AddBeneficiaryForm from "@/components/Assistance/BeneficiariesList/AddBeneficiaryForm";
import EditBeneficiaryForm from "@/components/Assistance/BeneficiariesList/EditBeneficiaryForm";
import EditInstitutionForm from "@/components/Assistance/BeneficiariesList/EditInstitutionForm";
import EditCommunityForm from "@/components/Assistance/BeneficiariesList/EditCommunityForm";
import ColumnField from "@/components/DataGrid/ColumnField";
import InputDistributed from "@/components/Assistance/InputDistributed/index";
import AssignVoucherForm from "@/components/Assistance/BeneficiariesList/AssignVoucherForm";
import ExportControl from "@/components/Export";
import AssistancesService from "@/services/AssistancesService";
import BeneficiariesService from "@/services/BeneficiariesService";
import { Notification } from "@/utils/UI";
import { generateColumns } from "@/utils/datagrid";
import consts from "@/utils/assistanceConst";
import baseHelper from "@/mixins/baseHelper";
import beneficiariesHelper from "@/mixins/beneficiariesHelper";
import permissions from "@/mixins/permissions";
import urlFiltersHelper from "@/mixins/urlFiltersHelper";
import { EXPORT } from "@/consts";

const statusTags = [
	{ code: "To distribute", type: "is-light" },
	{ code: "Distribution in progress", type: "is-info" },
	{ code: "Distributed", type: "is-success" },
	{ code: "Expired", type: "is-danger" },
	{ code: "Canceled", type: "is-warning" },
];

export default {
	name: "BeneficiariesList",

	props: {
		assistance: Object,
		project: Object,
		addButton: Boolean,
		changeButton: {
			type: Boolean,
			default: false,
		},
		exportButton: Boolean,
		commodities: {
			type: Array,
			default: () => [],
		},
		assistanceDetail: {
			type: Boolean,
			default: false,
		},
	},

	components: {
		AssignVoucherForm,
		AddBeneficiaryForm,
		EditBeneficiaryForm,
		EditInstitutionForm,
		EditCommunityForm,
		Table,
		ActionButton,
		Modal,
		ExportControl,
		ColumnField,
		InputDistributed,
	},

	mixins: [permissions, baseHelper, beneficiariesHelper, urlFiltersHelper],

	data() {
		return {
			isLoadingList: false,
			advancedSearchVisible: false,
			exportControl: {
				loading: false,
				location: "assistance",
				formats: [EXPORT.FORMAT_XLSX, EXPORT.FORMAT_CSV, EXPORT.FORMAT_ODS],
			},
			defaultSearchField: consts.SEARCH_FIELDS[2],
			selectedFilters: [],
			filters: { reliefPackageStates: [] },
			statusActive: {
				toDistribute: false,
				distributed: false,
				expired: false,
				canceled: false,
			},
			table: {
				data: [],
				columns: [],
				total: 0,
				currentPage: 1,
				sortDirection: "asc",
				sortColumn: "localFamilyName",
				searchPhrase: "",
				searchField: "",
				progress: null,
				customPerPage: null,
				checkedRows: [],
				settings: {
					assignVoucherAction: false,
					checkableTable: false,
				},
				visibleColumns: [],
				householdsAndIndividualEditColumns: [
					{ key: "id", label: "Beneficiary ID", sortable: true },
					{ key: "givenName", label: "Local given name", sortable: true, sortKey: "localGivenName" },
					{ key: "familyName", label: "Local family name", sortable: true, sortKey: "localFamilyName" },
					{ key: "gender" },
					{ key: "dateOfBirth", label: "Date of Birth", type: "date" },
					{ key: "residencyStatus" },
					{ key: "vulnerabilities", type: "svgIcon" },
				],
				communityColumns: [
					{ key: "id", label: "ID", sortable: true },
					{ key: "name", sortable: true },
					{ key: "contactGivenName", label: "Contact Name", sortable: true },
					{ key: "contactFamilyName", sortable: true },
				],
				institutionColumns: [
					{ key: "id", label: "ID", sortable: true },
					{ key: "name", sortable: true },
					{ key: "type", sortable: true },
					{ key: "contactGivenName", label: "Contact Name", sortable: true },
					{ key: "contactFamilyName", sortable: true },
				],
			},
			addBeneficiaryModal: {
				isOpened: false,
			},
			addBeneficiaryModel: {
				beneficiaries: [],
				removingId: null,
				justification: "",
			},
			beneficiaryModal: {
				isOpened: false,
				isEditing: false,
				isWaiting: false,
			},
			institutionModal: {
				isOpened: false,
				isEditing: false,
				isWaiting: false,
			},
			communityModal: {
				isOpened: false,
				isEditing: false,
				isWaiting: false,
			},
			inputDistributedModal: {
				isOpened: false,
				isWaiting: false,
			},
			addBeneficiariesByIdsModal: {
				isOpened: false,
				isWaiting: false,
			},
			beneficiaryModel: {
				firstName: null,
				familyName: null,
				gender: null,
				dateOfBirth: null,
				residencyStatus: null,
				status: null,
				referralType: null,
				comment: null,
				justification: null,
			},
			institutionModel: {
				addressStreet: null,
				addressNumber: null,
				addressPostCode: null,
			},
			communityModel: {
				addressStreet: null,
				addressNumber: null,
				addressPostCode: null,
			},
			randomSampleSize: 10,
			assignVoucherModal: {
				isOpened: false,
				isWaiting: false,
			},
			assignVoucherToBeneficiaryId: null,
		};
	},

	async created() {
		if (this.assistanceDetail) {
			this.setGridFilters("assistanceDetail", false);
		}
		await this.reloadBeneficiariesList();
	},

	watch: {
		async assistance(newAssistance) {
			if (newAssistance) {
				await this.reloadBeneficiariesList();
			}
		},
	},

	computed: {
		...mapState(["perPage"]),

		availableExportTypes() {
			if (this.exportButton && this.isDistributionExportVisible
				&& this.userCan.exportBeneficiaries && this.isAssistanceValidated) {
				return [
					EXPORT.LIST_OF_BENEFICIARIES,
					EXPORT.DISTRIBUTION_LIST,
					EXPORT.BANK_DISTRIBUTION_LIST,
					EXPORT.HOUSEHOLDS,
				];
			}

			if (this.exportButton && this.userCan.exportBeneficiaries) {
				return [
					EXPORT.LIST_OF_BENEFICIARIES,
					EXPORT.DISTRIBUTION_LIST,
					EXPORT.HOUSEHOLDS,
				];
			}

			return [];
		},

		householdsAndIndividualDetailColumns() {
			const baseColumns = [
				{ key: "id", label: "Beneficiary ID", sortable: true },
				{ key: "givenName", label: "Local given name", sortable: true, sortKey: "localGivenName" },
				{ key: "familyName", label: "Local family name", sortable: true, width: "190px", sortKey: "localFamilyName" },
				{ key: "nationalId", label: "ID Number", sortable: true },
				{ key: "status", type: "tagArray", customTags: statusTags },
				{ key: "toDistribute", type: "arrayTextBreak", sortable: true },
				{ key: "distributed", type: "arrayTextBreak", sortable: true },
				{ key: "spent", type: "arrayTextBreak", sortable: true },
				{ key: "lastModified", type: "arrayTextBreak", sortable: true },
			];

			if (!this.isCommoditySmartcard) {
				const spentIndex = baseColumns.findIndex((element) => element.key === "spent");
				baseColumns.splice(spentIndex, 1);
			}

			return baseColumns;
		},

		isAssistanceCompleted() {
			return this.assistance?.completed;
		},

		isAssistanceValidated() {
			return this.assistance?.validated;
		},

		isAddOrRemoveBeneficiaryAllowed() {
			return this.addButton && this.userCan.editDistribution
				&& !this.isAssistanceValidated;
		},

		isDistributionExportVisible() {
			return this.commodities.find((item) => item.modalityType === consts.COMMODITY.CASH)
				&& this.assistance?.type === "distribution"
				&& this.assistance?.subsector === "multi_purpose_cash_assistance";
		},

		isCommoditySmartcard() {
			return this.commodities.find((item) => item.modalityType === consts.COMMODITY.SMARTCARD);
		},

		isExportButtonDisabled() {
			return !this.table.data.length
				|| !this.userCan.exportBeneficiaries || this.changeButton;
		},

		searchFields() {
			return this.assistanceDetail ? consts.SEARCH_FIELDS : [];
		},

		toDistributeButtonClass() {
			return [
				"btn ml-3 is-light",
				{ "is-selected": this.statusActive.toDistribute },
			];
		},

		distributedButtonClass() {
			return [
				"btn ml-3 is-success is-light",
				{ "is-selected": this.statusActive.distributed },
			];
		},

		expiredButtonClass() {
			return [
				"btn ml-3 is-danger is-light",
				{ "is-selected": this.statusActive.expired },
			];
		},

		canceledButtonClass() {
			return [
				"btn ml-3 is-warning is-light",
				{ "is-selected": this.statusActive.canceled },
			];
		},
	},

	methods: {
		async reloadBeneficiariesList() {
			if (this.assistance) {
				this.prepareTableColumns();
				await this.fetchData();
			}
		},

		exportValuesUpdated(type) {
			if (type === EXPORT.BANK_DISTRIBUTION_LIST) {
				this.exportControl.formats = [EXPORT.FORMAT_XLSX];
			} else {
				this.exportControl.formats = [EXPORT.FORMAT_XLSX, EXPORT.FORMAT_CSV, EXPORT.FORMAT_ODS];
			}
		},

		addedOrRemovedBeneficiary() {
			this.$emit("assistanceUpdated");
			this.reloadBeneficiariesList();
		},

		fetchDataAfterBeneficiaryChange() {
			this.$emit("assistanceUpdated");
			this.reloadBeneficiariesList();
		},

		openInputDistributedModal() {
			this.inputDistributedModal.isOpened = true;
		},

		closeInputDistributedModal() {
			this.inputDistributedModal.isOpened = false;
		},

		openAddBeneficiariesByIdsModal() {
			this.addBeneficiariesByIdsModal.isOpened = true;
		},

		closeAddBeneficiariesByIdsModal() {
			this.addBeneficiariesByIdsModal.isOpened = false;
		},

		statusFilter(filter, queryValue = "") {
			const filterValue = queryValue.length ? queryValue : filter;
			this.statusActive[filter] = !this.statusActive[filter];

			if (this.selectedFilters.includes(filterValue)) {
				this.selectedFilters = this.selectedFilters.filter((item) => item !== filterValue);
			} else {
				this.selectedFilters.push(filterValue);
			}

			this.onFiltersChange({ reliefPackageStates: this.selectedFilters });
		},

		async onFiltersChange(selectedFilters) {
			this.filters = selectedFilters;
			this.table.currentPage = 1;
			await this.fetchData();
		},

		resetTableSort() {
			this.$refs.beneficiariesList.onResetSort();
		},

		resetFilters() {
			this.statusActive = {
				toDistribute: false,
				distributed: false,
				expired: false,
				canceled: false,
			};
			this.$refs.beneficiariesList.onResetSearch();
			this.selectedFilters = [];
			this.onFiltersChange({ reliefPackageStates: [] });
		},

		async fetchData(page, size) {
			this.isLoadingList = true;
			this.table.progress = null;
			this.table.data = [];
			switch (this.assistance.target) {
				case consts.TARGET.COMMUNITY:
					await AssistancesService.getListOfCommunities(
						this.$route.params.assistanceId,
						page || this.table.currentPage,
						size || this.perPage,
						this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
						this.table.searchPhrase,
					).then(async ({ data, totalCount }) => {
						this.table.data = [];
						this.table.progress = 0;
						this.$emit("beneficiariesCounted", totalCount);
						this.table.total = totalCount;
						if (totalCount > 0) {
							await this.prepareDataForTable(data);
						}
					}).catch((e) => {
						if (e.message) Notification(`${this.$t("Institutions")} ${e}`, "is-danger");
					});
					break;
				case consts.TARGET.INSTITUTION:
					await AssistancesService.getListOfInstitutions(
						this.$route.params.assistanceId,
						page || this.table.currentPage,
						size || this.perPage,
						this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
						this.table.searchPhrase,
					).then(async ({ data, totalCount }) => {
						this.table.data = [];
						this.table.progress = 0;
						this.$emit("beneficiariesCounted", totalCount);
						this.table.total = totalCount;
						if (totalCount > 0) {
							await this.prepareDataForTable(data);
						}
					}).catch((e) => {
						if (e.message) Notification(`${this.$t("Institutions")} ${e}`, "is-danger");
					});
					break;
				case consts.TARGET.HOUSEHOLD:
				case consts.TARGET.INDIVIDUAL:
				default:
					try {
						const { data: { data, totalCount } } = await AssistancesService
							.getOptimizedListOfBeneficiaries(
								this.$route.params.assistanceId,
								page || this.table.currentPage,
								size || this.perPage,
								this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
								{ phrase: this.table.searchPhrase, field: this.table.searchField },
								this.filters,
							);

						this.table.data = [];
						this.table.progress = 0;
						this.$emit("beneficiariesCounted", totalCount);
						this.table.total = totalCount;

						if (totalCount > 0) {
							await this.prepareDataForTable(data);
						}
					} catch (e) {
						if (e.message) Notification(`${this.$t("Beneficiaries")} ${e}`, "is-danger");
					} finally {
						if (this.assistanceDetail) {
							this.setGridFiltersToUrl("assistanceDetail", false, {
								sortColumn: true,
								sortDirection: true,
							});
						}
					}
			}

			this.isLoadingList = false;
		},

		prepareTableColumns() {
			let baseColumns = [];
			let additionalColumns = [];

			switch (this.assistance.target) {
				case consts.TARGET.COMMUNITY:
					baseColumns = this.table.communityColumns;
					break;
				case consts.TARGET.INSTITUTION:
					baseColumns = this.table.institutionColumns;
					break;
				case consts.TARGET.HOUSEHOLD:
				case consts.TARGET.INDIVIDUAL:
				default:
					baseColumns = this.assistanceDetail
						? this.householdsAndIndividualDetailColumns
						: this.table.householdsAndIndividualEditColumns;
			}

			const modality = this.commodities[0]?.modalityType;

			if (this.assistanceDetail && this.assistance.type === consts.TYPE.DISTRIBUTION) {
				if (modality === consts.COMMODITY.MOBILE_MONEY) {
					additionalColumns = [
						{ key: "phone" },
					];
				} else if (modality === consts.COMMODITY.QR_CODE_VOUCHER) {
					additionalColumns = [
						// Temporary hidden
						// { key: "booklet", type: "arrayTextBreak" },
					];
				}
			}

			this.table.visibleColumns = [...baseColumns, ...additionalColumns];
			this.table.columns = generateColumns(this.table.visibleColumns);
		},

		async prepareDataForTable(data) {
			this.table.progress += 25;
			let beneficiaryIds = [];
			let beneficiaries = [];

			const distributionItems = {
				reliefPackages: [],
			};

			switch (this.assistance.target) {
				case consts.TARGET.COMMUNITY:
					beneficiaryIds = data.map((item) => item.communityId);
					beneficiaries = await this.getCommunities(beneficiaryIds);

					data.forEach((community, key) => {
						const foundCommunity = beneficiaries.find(
							(bnf) => bnf.id === community.communityId,
						);

						const item = { ...community, ...foundCommunity };
						this.table.data[key] = item;

						if (item.reliefPackages?.length) {
							distributionItems.reliefPackages.push(...item.reliefPackages);
						}
					});

					this.table.data = [...this.table.data];

					this.table.progress += 55;
					break;
				case consts.TARGET.INSTITUTION:
					beneficiaryIds = data.map((item) => item.institutionId);
					beneficiaries = await this.getInstitutions(beneficiaryIds);

					data.forEach((institution, key) => {
						const foundInstitution = beneficiaries.find(
							(bnf) => bnf.id === institution.institutionId,
						);

						const item = { ...institution, ...foundInstitution };
						this.table.data[key] = item;

						if (item.reliefPackages?.length) {
							distributionItems.reliefPackages.push(...item.reliefPackages);
						}
					});

					this.table.data = [...this.table.data];

					this.table.progress += 55;
					break;
				case consts.TARGET.HOUSEHOLD:
				case consts.TARGET.INDIVIDUAL:
				default:
					data.forEach((item, key) => {
						const { beneficiary, reliefPackages } = item;

						this.table.data[key] = item;
						this.table.data[key].id = beneficiary.id;
						this.table.data[key].givenName = this
							.prepareName(beneficiary.localGivenName, beneficiary.enGivenName);
						this.table.data[key].familyName = this
							.prepareName(beneficiary.localFamilyName, beneficiary.enFamilyName);
						this.table.data[key].gender = this.prepareGender(beneficiary.gender);
						this.table.data[key].vulnerabilities = beneficiary.vulnerabilityCriteria;
						this.table.data[key].residencyStatus = beneficiary.residencyStatus;
						this.table.data[key].dateOfBirth = beneficiary.birthDate;
						this.table.data[key].nationalId = beneficiary.nationalIds.length
							? this.prepareNationalIdsValuesForTable(beneficiary.nationalIds)
							: this.$t("None");

						this.table.data[key].status = reliefPackages.map(
							(reliefPackage) => reliefPackage.state,
						);
						this.table.data[key].toDistribute = reliefPackages.map(
							(reliefPackage) => `${reliefPackage.toDistribute} ${reliefPackage.unit}`,
						);
						this.table.data[key].distributed = reliefPackages.map(
							(reliefPackage) => (`${reliefPackage.distributed} ${reliefPackage.unit}`),
						);
						this.table.data[key].spent = reliefPackages.map(
							(reliefPackage) => (`${reliefPackage.spent ?? 0} ${reliefPackage.unit}`),
						);
						this.table.data[key].lastModified = reliefPackages.map(
							(reliefPackage) => (
								this.$moment(reliefPackage.lastModified || reliefPackage.lastModified)
									.format("YYYY-MM-DD hh:mm")),
						);
						this.table.data[key].phone = beneficiary.phones.length
							? this.preparePhoneForTable(beneficiary.phones)
							: this.$t("None");
					});
			}

			if (this.assistanceDetail) {
				this.setAssignedReliefPackages();
			} else {
				this.table.progress = 100;
			}
		},

		async getCommunities(ids) {
			return BeneficiariesService.getCommunities(ids)
				.then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Communities")} ${e}`, "is-danger");
				});
		},

		async getInstitutions(ids) {
			return BeneficiariesService.getInstitutions(ids)
				.then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Institutions")} ${e}`, "is-danger");
				});
		},

		async getBeneficiaries(ids, filters) {
			return BeneficiariesService.getBeneficiaries(ids, filters)
				.then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Beneficiaries")} ${e}`, "is-danger");
				});
		},

		async exportDistribution(type, format) {
			this.exportControl.loading = true;

			switch (type) {
				case EXPORT.LIST_OF_BENEFICIARIES:
					await this.exportData(
						format,
						EXPORT.LIST_OF_BENEFICIARIES,
						`Beneficiaries ${this.assistance.name}`,
					);
					break;
				case EXPORT.DISTRIBUTION_LIST:
					await this.exportData(
						format,
						EXPORT.DISTRIBUTION_LIST,
						`Distribution list ${this.assistance.name}`,
					);
					break;
				case EXPORT.BANK_DISTRIBUTION_LIST:
					await this.exportData(
						format,
						EXPORT.BANK_DISTRIBUTION_LIST,
						`Bank distribution list ${this.assistance.name}`,
					);
					break;
				case EXPORT.HOUSEHOLDS:
					await this.exportData(
						format,
						EXPORT.HOUSEHOLDS,
						`BNF Households ${this.assistance.name}`,
					);
					break;
				default:
			}
			this.exportControl.loading = false;
		},

		async exportData(format, exportType, filename) {
			if (!this.changeButton) {
				await BeneficiariesService.exportAssistanceBeneficiaries(
					format,
					this.$route.params.assistanceId,
					this.table.searchPhrase,
					{ exportType },
				)
					.then(({ data, status, message }) => {
						if (status === 200) {
							const blob = new Blob([data], { type: data.type });
							const link = document.createElement("a");
							link.href = window.URL.createObjectURL(blob);
							link.download = `${filename}.${format}`;
							link.click();
						} else {
							Notification(message, "is-warning");
						}
					})
					.catch((e) => {
						if (e.message) Notification(`${this.$t("Export")} ${e}`, "is-danger");
					});
			} else {
				await BeneficiariesService.exportBeneficiaries(format, this.table.data, "id")
					.then(({ data, status, message }) => {
						if (status === 200) {
							const blob = new Blob([data], { type: data.type });
							const link = document.createElement("a");
							link.href = window.URL.createObjectURL(blob);
							link.download = `beneficiaries.${format}`;
							link.click();
						} else {
							Notification(message, "is-warning");
						}
					})
					.catch((e) => {
						if (e.message) Notification(`${this.$t("Export")} ${e}`, "is-danger");
					});
			}
		},
	},
};
</script>

<style>
.table-wrapper {
	min-height: 75px;
}

.removed-row {
	background-color: #f3f3f3 !important;
}
</style>

<style lang="scss" scoped>
@import 'src/assets/scss/button';
</style>
