<template>
	<div :class="['d-flex justify-space-between gc-3 mb-4 mt-2', { 'mt-12': !isAssistanceTargetHouseholdOrIndividual, 'flex-column': isMobile }]">
		<Modal
			v-model="addBeneficiaryModal.isOpened"
			:header="addBeneficiaryModel.removingId
				? 'Remove Beneficiary From This Assistance'
				: 'Add Beneficiaries to This Assistance'"
		>
			<AddBeneficiaryForm
				:form-model="addBeneficiaryModel"
				:assistance="assistance"
				submit-button-label="Confirm"
				close-button
				@addingOrRemovingSubmitted="onAddedOrRemovedBeneficiary"
				@formClosed="onCloseAddBeneficiaryModal"
			/>
		</Modal>

		<Modal
			v-model="inputDistributedModal.isOpened"
			header="Input Deduplication"
		>
			<InputDistributed
				class="modal-card"
				deduplication
				close-button
				@submit="onFetchDataAfterBeneficiaryChange"
				@close="onCloseInputDistributedModal"
			/>
		</Modal>

		<Modal
			v-model="assignVoucherModal.isOpened"
			header="Assign Booklet to a Beneficiary"
		>
			<AssignVoucherForm
				:beneficiary="assignVoucherToBeneficiaryId"
				:assistance="assistance"
				:project="project"
				submit-button-label="Confirm"
				close-button
				@scannedCode="onAssignBookletToBeneficiary"
				@formClosed="onCloseAssignVoucherModal"
			/>
		</Modal>

		<Modal
			v-model="addBeneficiariesByIdsModal.isOpened"
			header="Add to assistance"
		>
			<InputDistributed
				close-button
				adding-to-assistance
				class="modal-card"
				@submit="onFetchDataAfterBeneficiaryChange"
				@close="onCloseAddBeneficiariesByIdsModal"
			/>
		</Modal>

		<Modal
			v-model="beneficiaryModal.isOpened"
			:header="beneficiaryModal.isEditing
				? 'Edit This Beneficiary'
				: 'Detail of Beneficiary'"
		>
			<EditBeneficiaryForm
				:form-model="beneficiaryModel"
				:disabled="!beneficiaryModal.isEditing"
				submit-button-label="Save"
				class="modal-card"
				close-button
				@formSubmitted="onSubmitEditBeneficiaryForm"
				@formClosed="onCloseBeneficiaryModal"
			/>
		</Modal>

		<Modal
			v-model="institutionModal.isOpened"
			header="Detail of Institution"
		>
			<InstitutionForm
				:form-model="institutionModel"
				:institution-modal="institutionModal"
				close-button
				class="modal-card"
				@formClosed="closeInstitutionModal"
			/>
		</Modal>

		<div>
			<v-alert
				v-if="isCustomAmountBoxVisible && isCustomAmountEnabled && customFieldName"
				variant="outlined"
				type="info"
				border="start"
				max-width="900"
				class="mb-6"
			>
				{{ $t(`To change the amount to be distributed, you must change the Custom field:`) }}
				{{ customFieldName }}
				{{ $t(`value for the Beneficiary, and then use Recalculate.`) }}
			</v-alert>
		</div>

		<div>
			<v-btn
				v-if="isRecalculationButtonVisible && isCustomAmountEnabled && customFieldName"
				color="primary"
				prepend-icon="redo"
				class="text-none ma-2"
				@click="onRecalculate"
			>
				{{ $t('Recalculate') }}
			</v-btn>

			<v-btn
				v-if="isAddBeneficiaryAllowed"
				color="primary"
				prepend-icon="plus"
				class="text-none ma-2"
				@click="onOpenAddBeneficiaryModal(null, true)"
			>
				{{ $t('Add') }}
			</v-btn>

			<v-btn
				v-if="isBulkAddOrRemoveBeneficiaryAllowed"
				color="primary"
				prepend-icon="plus"
				class="text-none ma-2"
				@click="onOpenAddBeneficiariesByIdsModal"
			>
				{{ $t('Bulk add') }}
			</v-btn>

			<v-btn
				v-if="isBulkAddOrRemoveBeneficiaryAllowed"
				color="primary"
				prepend-icon="minus"
				class="text-none ma-2"
				@click="onOpenInputDistributedModal"
			>
				{{ $t('Bulk remove') }}
			</v-btn>

			<DataInput
				v-if="changeButton"
				v-model.number="randomSampleSize"
				label="Random Sample"
				name="random-sample"
				type="number"
				min="1"
				max="100"
				prepend-icon="exchange-alt"
				append-inner-icon="percent"
				class="random-sample"
				@click:prepend="onRandomSample"
			/>
		</div>
	</div>

	<v-divider />

	<DataGrid
		ref="beneficiariesList"
		v-model="table.checkedRows"
		v-model:items-per-page="perPage"
		v-model:sort-by="sortValue"
		:headers="table.columns"
		:items="table.data"
		:total-count="table.total"
		:loading="isLoadingList"
		:show-select="table.settings.checkableTable"
		:is-search-visible="!isAssistanceTargetInstitution"
		:search-phrase="table.searchPhrase"
		:search-fields="searchFields"
		:default-search-field="defaultSearchField"
		:selected-rows="selectedRows"
		:reset-filters-button="assistanceDetail"
		item-selectable="selectable"
		is-row-click-disabled
		reset-sort-button
		@update:modelValue="onRowsCheck"
		@perPageChanged="onPerPageChange"
		@pageChanged="onPageChange"
		@search="onBeneficiariesSearch"
		@update:sortBy="onSort"
		@resetFilters="onResetFilters"
		@resetSort="onResetSort(defaultSortOptions)"
	>
		<template v-slot:actions="{ index, row }">
			<ButtonAction
				v-if="isNotDistributedButtonVisible(row)"
				icon="user-slash"
				tooltip-text="Set as not distributed"
				confirm-title="Set as not distributed"
				confirm-message="Do you really want to set as not distributed?"
				prepend-icon="circle-exclamation"
				prepend-icon-color="info"
				close-button-name="Cancel"
				confirm-button-name="Set"
				confirm-button-color="primary"
				is-confirm-action
				@actionConfirmed="onSetAsNotDistributed(index, row.id, row.reliefPackages)"
			/>

			<ButtonAction
				v-if="userCan.editDistribution"
				icon="search"
				tooltip-text="View"
				@actionConfirmed="onOpenViewModal(row)"
			/>

			<ButtonAction
				v-if="userCan.editDistribution && !isAssistanceValidated"
				:disabled="row.removed || isAssistanceCompleted"
				icon="trash"
				icon-color="red"
				tooltip-text="Delete"
				@actionConfirmed="onOpenAddBeneficiaryModal(getIdForDelete(row), !(row.removed
					|| isAssistanceCompleted))"
			/>

			<ButtonAction
				v-if="table.settings.assignVoucherAction
					&& userCan.assignDistributionItems"
				:disabled="!row.canAssignVoucher"
				icon="qrcode"
				tooltip-text="Assign Voucher"
				@actionConfirmed="onOpenAssignVoucherModal(row.id, row.canAssignVoucher)"
			/>
		</template>

		<template v-slot:tableControls>
			<ExportControl
				:disabled="isExportButtonDisabled"
				:available-export-formats="exportControl.formats"
				:available-export-types="availableExportTypes"
				:is-export-loading="isExportLoading"
				:location="exportControl.location"
				@inputUpdated="onExportValuesUpdated"
				@export="onExportDistribution"
			/>

			<template v-if="assistanceDetail">
				<v-btn
					:class="toDistributeButtonClass"
					color="gray-darken-4"
					variant="tonal"
					class="ml-0"
					prepend-icon="sticky-note"
					@click="onStatusFilter('toDistribute', 'To distribute')"
					@keydown.enter.prevent
				>
					{{ $t('To distribute') }}
				</v-btn>

				<v-btn
					:class="distributedButtonClass"
					color="green-darken-4"
					variant="tonal"
					class="ml-0"
					prepend-icon="sticky-note"
					@click="onStatusFilter('distributed')"
					@keydown.enter.prevent
				>
					{{ $t('Distributed') }}
				</v-btn>

				<v-btn
					:class="expiredButtonClass"
					class="ml-0"
					color="red-darken-1"
					variant="tonal"
					prepend-icon="sticky-note"
					@click="onStatusFilter('expired')"
					@keydown.enter.prevent
				>
					{{ $t('Expired') }}
				</v-btn>

				<v-btn
					:class="canceledButtonClass"
					class="ml-0"
					color="amber-lighten-1"
					variant="tonal"
					prepend-icon="sticky-note"
					@click="onStatusFilter('canceled')"
					@keydown.enter.prevent
				>
					{{ $t('Canceled') }}
				</v-btn>
			</template>
		</template>
	</DataGrid>
</template>

<script>
import { mapState } from "vuex";
import AssistancesService from "@/services/AssistancesService";
import BeneficiariesService from "@/services/BeneficiariesService";
import InstitutionService from "@/services/InstitutionService";
import AddBeneficiaryForm from "@/components/Assistance/BeneficiariesList/AddBeneficiaryForm";
import AssignVoucherForm from "@/components/Assistance/BeneficiariesList/AssignVoucherForm";
import EditBeneficiaryForm from "@/components/Assistance/BeneficiariesList/EditBeneficiaryForm";
import InputDistributed from "@/components/Assistance/InputDistributed/index";
import InstitutionForm from "@/components/Beneficiaries/InstitutionForm";
import ButtonAction from "@/components/ButtonAction";
import DataGrid from "@/components/DataGrid";
import DataInput from "@/components/Inputs/DataInput";
import ExportControl from "@/components/Inputs/ExportControl";
import Modal from "@/components/Inputs/Modal";
import assistanceHelper from "@/mixins/assistanceHelper";
import baseHelper from "@/mixins/baseHelper";
import beneficiariesHelper from "@/mixins/beneficiariesHelper";
import grid from "@/mixins/grid";
import permissions from "@/mixins/permissions";
import urlFiltersHelper from "@/mixins/urlFiltersHelper";
import vuetifyHelper from "@/mixins/vuetifyHelper";
import { generateColumns, normalizeText } from "@/utils/datagrid";
import { downloadFile } from "@/utils/helpers";
import { Notification } from "@/utils/UI";
import { ASSISTANCE, EXPORT, INSTITUTION, TABLE } from "@/consts";

const statusTags = [
	{ code: "To distribute", type: "grey-lighten-2" },
	{ code: "Distributed", type: "green-lighten-1" },
	{ code: "Expired", type: "red-lighten-1" },
	{ code: "Canceled", type: "amber-lighten-4" },
];

export default {
	name: "BeneficiariesList",

	emits: [
		"assistanceUpdated",
		"beneficiariesCounted",
		"fetchAssistanceStatistics",
	],

	components: {
		AssignVoucherForm,
		AddBeneficiaryForm,
		EditBeneficiaryForm,
		DataGrid,
		DataInput,
		ButtonAction,
		Modal,
		ExportControl,
		InputDistributed,
		InstitutionForm,
	},

	mixins: [
		permissions,
		baseHelper,
		beneficiariesHelper,
		urlFiltersHelper,
		vuetifyHelper,
		assistanceHelper,
		grid,
	],

	props: {
		assistance: Object,
		project: Object,
		addButton: Boolean,
		exportButton: Boolean,

		changeButton: {
			type: Boolean,
			default: false,
		},

		commodities: {
			type: Array,
			default: () => [],
		},

		assistanceDetail: {
			type: Boolean,
			default: false,
		},

		defaultSortDirection: {
			type: String,
			default: "asc",
		},

		defaultSortColumn: {
			type: String,
			default: "familyName",
		},

		isNotDistributedAvailable: {
			type: Boolean,
			default: false,
		},

		isRecalculationButtonVisible: {
			type: Boolean,
			default: false,
		},

		isCustomAmountBoxVisible: {
			type: Boolean,
			default: false,
		},
	},

	data() {
		return {
			isLoadingList: false,
			isRecalculationLoading: false,
			advancedSearchVisible: false,
			selectedRows: 0,
			exportControl: {
				loading: false,
				location: "assistance",
				formats: [EXPORT.FORMAT_XLSX, EXPORT.FORMAT_CSV, EXPORT.FORMAT_ODS],
				isBnfFileTypeSelected: false,
			},
			defaultSearchField: ASSISTANCE.SEARCH_FIELDS[2],
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
				sortDirection: "",
				sortColumn: "",
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
				communityColumns: [
					{ key: "id", title: "ID" },
					{ key: "name" },
					{ key: "contactGivenName", title: "Contact Name" },
					{ key: "contactFamilyName" },
				],
				institutionEditColumns: [
					{ key: "id", title: "ID", sortable: false },
					{ key: "name" },
					{ key: "type" },
					{ key: "contactGivenName" },
					{ key: "contactFamilyName" },
					{ key: "phone", title: "Phone Number", sortable: false },
					{ key: "actions", value: "actions", sortable: false },
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
			institutionModel: { ...INSTITUTION.DEFAULT_FORM_MODEL },
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
			bnfFile3Statistics: {},
		};
	},

	computed: {
		...mapState(["perPage"]),

		availableExportTypes() {
			const availableTypes = [];

			if (this.exportButton && this.userCan.exportBeneficiaries && this.assistance?.target) {
				if (!this.isAssistanceTargetInstitution) {
					availableTypes.push(
						EXPORT.LIST_OF_BENEFICIARIES,
						EXPORT.DISTRIBUTION_LIST,
						EXPORT.HOUSEHOLDS,
					);
				} else {
					availableTypes.push(EXPORT.INSTITUTIONS);
				}

				if (this.isAssistanceValidated) {
					if (this.isDistributionExportVisible && !this.isAssistanceTargetInstitution) {
						availableTypes.push(EXPORT.BANK_DISTRIBUTION_LIST);
					}

					if (this.assistance.bnfFile3ExportId) {
						availableTypes.push(EXPORT.BNF_FILE_3.OPTION_NAME);
					}
				}
			}

			return availableTypes;
		},

		prepareValueType() {
			const currencyTypes = [ASSISTANCE.COMMODITY.CASH, ASSISTANCE.COMMODITY.SMARTCARD];

			return currencyTypes.includes(this.assistance?.commodities[0].modalityType)
				? "Currency"
				: "Unit";
		},

		householdsAndIndividualEditColumns() {
			return [
				{ key: "id", title: "Beneficiary ID", sortable: false },
				{
					key: "givenName",
					title: "Local given name",
					sortKey: "localGivenName",
					sortable: false,
				},
				{
					key: "familyName",
					title: "Local family name",
					sortKey: "localFamilyName",
					sortable: false,
				},
				{ key: "gender", sortable: false },
				{ key: "dateOfBirth", title: "Date of Birth", type: "date", sortable: false },
				{ key: "residencyStatus", sortable: false },
				{ key: "vulnerabilities", type: "svgIcon", sortable: false },
				...this.isCustomAmountEnabled && this.customFieldName
					? [
						{ key: "toDistribute", type: "arrayTextBreak", sortable: false },
					]
					: [],
				{ key: "actions", value: "actions", sortable: false },
			];
		},

		householdsAndIndividualDetailColumns() {
			const baseColumns = [
				{ key: "id", title: "Beneficiary ID", sortable: false },
				{
					key: "givenName",
					title: "Local given name",
					sortKey: "localGivenName",
					sortable: false,
				},
				{
					key: "familyName",
					title: "Local family name",
					width: "190px",
					sortKey: "localFamilyName",
					sortable: false,
				},
				{ key: "nationalId", title: "ID Number", sortable: false },
				{ key: "status", type: "tagArray", customTags: statusTags, sortable: false },
				...!this.isAssistanceTypeActivity
					? [
						{ key: "toDistribute", type: "arrayTextBreak" },
						{ key: "distributed", type: "arrayTextBreak" },
					]
					: [],
				{ key: "spent", type: "arrayTextBreak" },
				{ key: "lastModified", type: "arrayTextBreak" },
				{ key: "actions", value: "actions", sortable: false },
			];

			if (!this.isCommoditySmartcard) {
				const spentIndex = baseColumns.findIndex((element) => element.key === "spent");
				baseColumns.splice(spentIndex, 1);
			}

			return baseColumns;
		},

		institutionDetailColumns() {
			return [
				{ key: "id", title: "ID", sortable: false },
				{ key: "name" },
				{ key: "type" },
				{ key: "contactGivenName" },
				{ key: "contactFamilyName" },
				{ key: "phone", title: "Phone Number", sortable: false },
				{ key: "status", type: "tagArray", customTags: statusTags, sortable: false },
				{ key: "toDistribute", type: "arrayTextBreak", sortable: false },
				{ key: "distributed", type: "arrayTextBreak", sortable: false },
				{ key: "lastModified", type: "arrayTextBreak", sortable: false },
				{ key: "actions", value: "actions", sortable: false },
			];
		},

		customFieldName() {
			return this.commodities?.[0]?.division?.customFieldName;
		},

		defaultSortKey() {
			return this.isAssistanceTargetInstitution ? "name" : "localFamilyName";
		},

		isAssistanceCompleted() {
			return this.assistance?.completed;
		},

		isAssistanceValidated() {
			return this.assistance?.validated;
		},

		isAddBeneficiaryAllowed() {
			return (this.addButton || this.isAssistanceTargetInstitution) && this.userCan.editDistribution
				&& !this.isAssistanceValidated;
		},

		isBulkAddOrRemoveBeneficiaryAllowed() {
			return this.addButton && this.userCan.editDistribution
				&& !this.isAssistanceValidated;
		},

		isDistributionExportVisible() {
			return this.commodities.find((item) => item.modalityType === ASSISTANCE.COMMODITY.CASH)
				&& this.assistance?.type === "distribution"
				&& this.assistance?.subsector === "multi_purpose_cash_assistance";
		},

		isCommoditySmartcard() {
			return this.commodities.find((item) => item.modalityType === ASSISTANCE.COMMODITY.SMARTCARD);
		},

		isExportButtonDisabled() {
			return !this.table.data.length
				|| !this.userCan.exportBeneficiaries
				|| this.changeButton;
		},

		isAssistanceTargetHouseholdOrIndividual() {
			return this.assistance?.target === ASSISTANCE.TARGET.HOUSEHOLD
				|| this.assistance?.target === ASSISTANCE.TARGET.INDIVIDUAL;
		},

		isAssistanceTargetInstitution() {
			return this.assistance?.target === ASSISTANCE.TARGET.INSTITUTION;
		},

		isAssistanceTypeActivity() {
			return this.assistance?.type === ASSISTANCE.TYPE.ACTIVITY;
		},

		isAssistanceClosed() {
			return this.assistance?.state.code === ASSISTANCE.STATUS.CLOSED;
		},

		searchFields() {
			return this.assistanceDetail ? ASSISTANCE.SEARCH_FIELDS : [];
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

		isBnfFile3Exported() {
			return this.bnfFile3Statistics.state === EXPORT.BNF_FILE_3.STATE.EXPORTED;
		},

		isExportLoading() {
			return this.exportControl.loading
				|| (!this.isBnfFile3Exported && this.exportControl.isBnfFileTypeSelected);
		},

		defaultSortOptions() {
			if (this.assistance.target === ASSISTANCE.TARGET.INSTITUTION) {
				return TABLE.DEFAULT_SORT_OPTIONS.ASSISTANCE_EDIT.INSTITUTION;
			}
			return TABLE.DEFAULT_SORT_OPTIONS.ASSISTANCE_EDIT.HOUSEHOLD;
		},
	},

	watch: {
		async assistance(newAssistance) {
			if (newAssistance) {
				if (newAssistance.target === ASSISTANCE.TARGET.INSTITUTION) {
					this.table.sortColumn = TABLE.DEFAULT_SORT_OPTIONS.ASSISTANCE_EDIT.INSTITUTION.key;
					this.table.sortDirection = TABLE.DEFAULT_SORT_OPTIONS.ASSISTANCE_EDIT.INSTITUTION.order;
				}

				await this.reloadBeneficiariesList();
			}
		},
	},

	async created() {
		if (!this.assistanceDetail) {
			if (this.assistance?.target === ASSISTANCE.TARGET.HOUSEHOLD
				|| this.assistance?.target === ASSISTANCE.TARGET.INDIVIDUAL) {
				this.table.sortColumn = TABLE.DEFAULT_SORT_OPTIONS.ASSISTANCE_EDIT.HOUSEHOLD.key;
				this.table.sortDirection = TABLE.DEFAULT_SORT_OPTIONS.ASSISTANCE_EDIT.HOUSEHOLD.order;
			}
		} else {
			this.setGridFilters("assistanceDetail", false);
		}
		await this.reloadBeneficiariesList();
	},

	methods: {
		async reloadBeneficiariesList() {
			if (this.assistance) {
				this.prepareTableColumns();
				await this.fetchData();
			}
		},

		async onExportValuesUpdated(type) {
			this.exportControl.isBnfFileTypeSelected = (type === EXPORT.BNF_FILE_3.OPTION_NAME);

			if (this.exportControl.isBnfFileTypeSelected) {
				const { bnfFile3ExportId } = this.assistance;

				this.exportControl.formats = [EXPORT.FORMAT_XLSX];

				if (this.isBnfFile3Exported) return;

				await this.fetchBnfFile3Statistics(bnfFile3ExportId);
				await this.fetchBnfFile3StatisticsInterval(bnfFile3ExportId);
			} else if (type === EXPORT.BANK_DISTRIBUTION_LIST) {
				this.exportControl.formats = [EXPORT.FORMAT_XLSX];
			} else {
				this.exportControl.formats = [EXPORT.FORMAT_XLSX, EXPORT.FORMAT_CSV, EXPORT.FORMAT_ODS];
			}
		},

		onAddedOrRemovedBeneficiary() {
			this.$emit("assistanceUpdated");
			this.reloadBeneficiariesList();
		},

		onFetchDataAfterBeneficiaryChange() {
			this.$emit("assistanceUpdated");
			this.reloadBeneficiariesList();
		},

		onOpenInputDistributedModal() {
			this.inputDistributedModal.isOpened = true;
		},

		onCloseInputDistributedModal() {
			this.inputDistributedModal.isOpened = false;
		},

		onOpenAddBeneficiariesByIdsModal() {
			this.addBeneficiariesByIdsModal.isOpened = true;
		},

		onCloseAddBeneficiariesByIdsModal() {
			this.addBeneficiariesByIdsModal.isOpened = false;
		},

		onStatusFilter(filter, queryValue = "") {
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

			if (selectedFilters.reliefPackageStates?.length) {
				await this.fetchData();
			}
		},

		async onResetFilters() {
			this.statusActive = {
				toDistribute: false,
				distributed: false,
				expired: false,
				canceled: false,
			};

			this.selectedFilters = [];
			await this.onFiltersChange({ reliefPackageStates: [] });

			if (this.$refs.beneficiariesList.searchValue().length) {
				this.$refs.beneficiariesList.resetSearch();
			} else {
				await this.fetchData();
			}
		},

		getIdForDelete(row) {
			return this.isAssistanceTargetInstitution ? row.institution.id : row.id;
		},

		isNotDistributedButtonVisible({ status }) {
			return this.isNotDistributedAvailable
				&& status[0] === ASSISTANCE.RELIEF_PACKAGES.STATE.DISTRIBUTED
				&& this.userCan.revertDistribution;
		},

		onOpenViewModal(row) {
			if (this.isAssistanceTargetInstitution) {
				this.showDetailModal(row);
			} else {
				this.showEditModal(row);
			}
		},

		async fetchData(page, size) {
			this.isLoadingList = true;
			this.table.progress = null;
			this.table.data = [];
			switch (this.assistance.target) {
				case ASSISTANCE.TARGET.COMMUNITY:
					await AssistancesService.getListOfCommunities(
						this.$route.params.assistanceId,
						page || this.table.currentPage,
						size || this.perPage,
						this.table.sortColumn !== ""
							? `${this.table.sortColumn?.sortKey || this.table.sortColumn}.${this.table.sortDirection}`
							: "",
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
						Notification(`${this.$t("Institutions")} ${e.message || e}`, "error");
					});
					break;
				case ASSISTANCE.TARGET.INSTITUTION:
					try {
						const { data: { data, totalCount } } = await AssistancesService
							.getListOfInstitutions(
								this.$route.params.assistanceId,
								page || this.table.currentPage,
								size || this.perPage,
								this.table.sortColumn !== ""
									? `${this.table.sortColumn?.sortKey || this.table.sortColumn}.${this.table.sortDirection}`
									: "",
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
						Notification(`${this.$t("Institutions")} ${e.message || e}`, "error");
					}
					break;
				case ASSISTANCE.TARGET.HOUSEHOLD:
				case ASSISTANCE.TARGET.INDIVIDUAL:
				default:
					try {
						const search = this.assistanceDetail
							? { phrase: this.table.searchPhrase, field: this.table.searchField }
							: this.table.searchPhrase;

						const { data: { data, totalCount } } = await AssistancesService
							.getOptimizedListOfBeneficiaries(
								this.$route.params.assistanceId,
								page || this.table.currentPage,
								size || this.perPage,
								this.table.sortColumn !== ""
									? `${this.table.sortColumn?.sortKey || this.table.sortColumn}.${this.table.sortDirection}`
									: "",
								search,
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
						Notification(`${this.$t("Beneficiaries")} ${e.message || e}`, "error");
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
				case ASSISTANCE.TARGET.COMMUNITY:
					baseColumns = this.table.communityColumns;
					break;
				case ASSISTANCE.TARGET.INSTITUTION:
					baseColumns = this.assistanceDetail
						? this.institutionDetailColumns
						: this.table.institutionEditColumns;
					break;
				case ASSISTANCE.TARGET.HOUSEHOLD:
				case ASSISTANCE.TARGET.INDIVIDUAL:
				default:
					baseColumns = this.assistanceDetail
						? this.householdsAndIndividualDetailColumns
						: this.householdsAndIndividualEditColumns;
			}

			const modality = this.commodities[0]?.modalityType;

			if (this.assistanceDetail && this.assistance.type === ASSISTANCE.TYPE.DISTRIBUTION) {
				if (modality === ASSISTANCE.COMMODITY.MOBILE_MONEY) {
					additionalColumns = [
						{ key: "phone" },
					];
				} else if (modality === ASSISTANCE.COMMODITY.QR_CODE_VOUCHER) {
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
			this.table.checkedRows = [];
			let beneficiaryIds = [];
			let beneficiaries = [];

			const distributionItems = {
				reliefPackages: [],
			};

			switch (this.assistance.target) {
				case ASSISTANCE.TARGET.COMMUNITY:
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
				case ASSISTANCE.TARGET.INSTITUTION:
					data.forEach((item, key) => {
						const { institution, reliefPackages } = item;
						const { id, contactGivenName, contactFamilyName, name } = institution;
						const type = normalizeText(institution.type);
						const phone = institution.phone?.number;

						this.table.data[key] = {
							...item,
							id,
							name,
							type,
							contactGivenName,
							contactFamilyName,
							phone,
						};

						if (this.assistanceDetail) {
							const status = reliefPackages.map((rp) => rp.state);
							const toDistribute = reliefPackages.map((rp) => `${rp.toDistribute} ${rp.unit}`);
							const distributed = reliefPackages.map((rp) => `${rp.distributed} ${rp.unit}`);
							const lastModified = reliefPackages.map((rp) => this.$moment(
								rp.lastModified || rp.lastModified,
							).format("YYYY-MM-DD hh:mm"));
							const isDistributed = reliefPackages.length && reliefPackages.every(
								(rp) => rp.state === ASSISTANCE.RELIEF_PACKAGES.STATE.DISTRIBUTED,
							);
							const isCanceled = reliefPackages.length && reliefPackages.every(
								(rp) => rp.state === ASSISTANCE.RELIEF_PACKAGES.STATE.CANCELED,
							);

							this.table.data[key] = {
								...this.table.data[key],
								status,
								toDistribute,
								distributed,
								lastModified,
								selectable: !isDistributed && !isCanceled,
							};

							if (isDistributed) this.table.checkedRows.push(this.table.data[key].id);
						}
					});

					this.table.progress += 55;
					break;
				case ASSISTANCE.TARGET.HOUSEHOLD:
				case ASSISTANCE.TARGET.INDIVIDUAL:
				default:
					data.forEach((item, key) => {
						const { beneficiary, reliefPackages } = item;
						const { id, residencyStatus } = beneficiary;
						const givenName = this.prepareName(beneficiary.localGivenName, beneficiary.enGivenName);
						const familyName = this.prepareName(beneficiary.localFamilyName, beneficiary.enFamilyName);
						const dateOfBirth = beneficiary.birthDate;
						const gender = this.$t(normalizeText(beneficiary.gender));
						const vulnerabilities = beneficiary.vulnerabilityCriteria;
						const nationalId = beneficiary.nationalIds.length
							? this.prepareNationalIdsValuesForTable(beneficiary.nationalIds)
							: this.$t("None");

						const status = reliefPackages.map(
							(rp) => rp.state,
						);
						const toDistribute = reliefPackages.map(
							(rp) => `${rp.toDistribute} ${rp.unit}`,
						);
						const distributed = reliefPackages.map(
							(rp) => `${rp.distributed} ${rp.unit}`,
						);
						const spent = reliefPackages.map(
							(rp) => `${rp.spent ?? 0} ${rp.unit}`,
						);
						const lastModified = reliefPackages.map(
							(rp) => (this.$moment(
								rp.lastModified || rp.lastModified,
							).format("YYYY-MM-DD hh:mm")),
						);
						const phone = beneficiary.phones.length
							? this.preparePhoneForTable(beneficiary.phones)
							: this.$t("None");
						const isDistributed = reliefPackages.length && reliefPackages.every(
							(rp) => rp.state === ASSISTANCE.RELIEF_PACKAGES.STATE.DISTRIBUTED,
						);
						const isCanceled = reliefPackages.length && reliefPackages.every(
							(rp) => rp.state === ASSISTANCE.RELIEF_PACKAGES.STATE.CANCELED,
						);

						this.table.data[key] = {
							...item,
							id,
							residencyStatus,
							givenName,
							familyName,
							gender,
							vulnerabilities,
							dateOfBirth,
							nationalId,
							status,
							toDistribute,
							distributed,
							spent,
							lastModified,
							phone,
							selectable: !isDistributed && !isCanceled,
						};

						if (isDistributed) this.table.checkedRows.push(this.table.data[key].id);
					});
			}

			if (this.assistanceDetail) {
				this.setAssignedReliefPackages();
			} else {
				this.table.progress = 100;
			}
		},

		async onRecalculate() {
			try {
				this.isRecalculationLoading = true;

				const { message, status } = await BeneficiariesService.recalculateReliefPackages(
					this.assistance.id,
				);

				if (status !== 200) {
					throw new Error(message);
				}

				this.$emit("assistanceUpdated");
				await this.reloadBeneficiariesList();
				this.$emit("fetchAssistanceStatistics");

				Notification(this.$t("Assistance Successfully Recalculated"), "success");
			} catch (e) {
				Notification(`${this.$t("Recalculation")} ${e.message || e}`, "error");
			} finally {
				this.isRecalculationLoading = false;
			}
		},

		async onSetAsNotDistributed(tableIndex, bnfId, reliefPackage) {
			try {
				const { data, status, message } = await AssistancesService
					.revertDistributionOfReliefPackage(reliefPackage[0].id);

				if (status !== 200) {
					throw new Error(message);
				}

				Notification(
					`${this.$t("Successfully set as not distributed for Beneficiary ID")} ${bnfId}`,
					"success",
				);

				const updatedRow = {
					status: [data.state],
					distributed: [`${data.distributed} ${data.unit}`],
					lastModified: [this.$moment(data.lastModified).format("YYYY-MM-DD hh:mm")],
					selectable: true,
				};

				const unDistributedItemIndex = this.table.checkedRows.findIndex(
					(row) => row === this.table.data[tableIndex].id,
				);

				this.table.checkedRows.splice(unDistributedItemIndex, 1);
				this.table.data = this.table.data.map(
					(row, index) => (index === tableIndex ? { ...row, ...updatedRow } : row),
				);

				this.$emit("fetchAssistanceStatistics");
			} catch (e) {
				Notification(`${this.$t("Set as not distributed")} ${e.message || e}`, "error");
			}
		},

		async getCommunities(ids) {
			return BeneficiariesService.getCommunities(ids)
				.then(({ data }) => data)
				.catch((e) => {
					Notification(`${this.$t("Communities")} ${e.message || e}`, "error");
				});
		},

		async getBeneficiaries(ids, filters) {
			return BeneficiariesService.getBeneficiaries(ids, filters)
				.then(({ data }) => data)
				.catch((e) => {
					Notification(`${this.$t("Beneficiaries")} ${e.message || e}`, "error");
				});
		},

		async fetchBnfFile3Statistics(bnfFile3ExportId) {
			try {
				const { data } = await BeneficiariesService.getBnfFile3ExportStatistics(
					bnfFile3ExportId,
				);

				this.bnfFile3Statistics = data;
			} catch (e) {
				Notification(`${this.$t("BNF File 3 Statistics")} ${e.message || e}`, "error");
			}
		},

		async fetchBnfFile3StatisticsInterval(bnfFile3ExportId) {
			const bnfFileStatisticsInterval = setInterval(async () => {
				if (this.bnfFile3Statistics.state === EXPORT.BNF_FILE_3.STATE.EXPORTED) {
					clearInterval(bnfFileStatisticsInterval);
				} else {
					await this.fetchBnfFile3Statistics(bnfFile3ExportId);
				}
			}, 5000);
		},

		async onExportDistribution(type, format) {
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
				case EXPORT.BNF_FILE_3.OPTION_NAME:
					await this.exportData(
						format,
						EXPORT.BNF_FILE_3.OPTION_NAME,
						`BNF File 3 ${this.assistance.name}`,
					);

					break;
				case EXPORT.INSTITUTIONS:
					await this.exportData(
						format,
						EXPORT.INSTITUTIONS,
						`Institution ${this.assistance.name}`,
					);

					break;
				default:
					break;
			}
			this.exportControl.loading = false;
		},

		async exportData(format, exportType, filename) {
			if (!this.changeButton) {
				if (exportType === EXPORT.BNF_FILE_3.OPTION_NAME) {
					try {
						const { data, status, message } = await BeneficiariesService.exportBnf3File(
							format,
							this.assistance.bnfFile3ExportId,
						);

						downloadFile(data, filename, status, format, message);
					} catch (e) {
						Notification(`${this.$t("BNF File 3 Export")} ${e.message || e}`, "error");
					}
				} else if (exportType === EXPORT.INSTITUTIONS) {
					try {
						const filters = { assistanceId: this.assistance.id };
						const { data, status, message } = await InstitutionService.exportInstitutions(
							format,
							filters,
						);

						downloadFile(data, filename, status, format, message);
					} catch (e) {
						Notification(`${this.$t("Export")} ${e.message || e}`, "error");
					}
				} else {
					try {
						const { data, status, message } = await BeneficiariesService
							.exportAssistanceBeneficiaries(
								format,
								this.$route.params.assistanceId,
								this.table.searchPhrase,
								{ exportType },
							);

						downloadFile(data, filename, status, format, message);
					} catch (e) {
						Notification(`${this.$t("Export")} ${e.message || e}`, "error");
					}
				}
			} else {
				try {
					const { data, status, message } = BeneficiariesService.exportBeneficiaries(
						format,
						this.table.data,
						"id",
					);

					downloadFile(data, filename, status, format, message);
				} catch (e) {
					Notification(`${this.$t("Export")} ${e.message || e}`, "error");
				}
			}
		},
	},
};
</script>

<style lang="scss">
.random-sample {
	max-width: 15rem;
}
</style>
