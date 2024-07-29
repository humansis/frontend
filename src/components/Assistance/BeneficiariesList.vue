<template>
	<div :class="['d-flex justify-space-between gc-3 mb-4 mt-2', { 'mt-12': !isAssistanceTargetHouseholdOrIndividual, 'flex-column': isMobile }]">
		<Modal
			v-model="addBeneficiaryModal.isOpened"
			:header="addBeneficiaryModel.removingId
				? 'Remove Beneficiary From This Assistance'
				: 'Add Beneficiaries to this Assistance'"
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
				@formClosed="closeInstitutionModal"
			/>
		</Modal>

		<ApprovalSystem
			v-if="approvalSystemData.isModalOpened"
			:approval-system-data="approvalSystemData"
			@form-closed="approvalSystemData.isModalOpened = false"
			@approvalCreated="onSuccessfullyCreatedRequest"
			@approved="onSuccessfullyApprovedRequest"
			@rejected="onSuccessfullyRejectedRequest"
		/>

		<ConfirmAction
			:is-dialog-opened="isWarningDialogOpenedForInvalidation"
			:is-confirm-button-visible="false"
			:confirm-message="warningMessageForInvalidation"
			confirm-title="Set as Invalidated"
			prepend-icon="circle-exclamation"
			prepend-icon-color="warning"
			close-button-name="Cancel"
			confirm-button-name=""
			@modalClosed="isWarningDialogOpenedForInvalidation = false"
		/>

		<div>
			<v-alert
				v-if="isCustomAmountBoxVisible && isCustomAmountEnabled && customFieldName"
				variant="outlined"
				type="info"
				border="start"
				max-width="900"
				class="mb-6"
			>
				{{ $t(`To change the amount to be distributed, you must change the Custom field: {customFieldName} value for the Beneficiary, and then use Recalculate.`, { customFieldName }) }}
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
		:class="{ 'completed-assistance': isAssistanceCompleted }"
		item-selectable="selectable"
		is-row-click-disabled
		reset-sort-button
		is-frontend-sort-disabled
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
				v-if="isInvalidateButtonVisible(row)"
				icon="credit-card"
				tooltip-text="Request for Invalidation"
				@actionConfirmed="onSetSmartCardAsInvalid(row.id, row.reliefPackages[0])"
			>
				<template v-slot:combinedIcons>
					<v-icon icon="slash" class="card-icon" />
				</template>
			</ButtonAction>

			<ButtonAction
				v-if="isInvalidationApprovalVisible(row.reliefPackages)"
				icon="flag"
				tooltip-text="Approve Invalidation"
				@actionConfirmed="onSetApproveInvalidation(row.id, row.reliefPackages[0])"
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
					variant="tonal"
					prepend-icon="sticky-note"
					@click="onStatusFilter('toDistribute', 'To distribute')"
					@keydown.enter.prevent
				>
					{{ $t('To distribute') }}
				</v-btn>

				<v-btn
					:class="distributedButtonClass"
					variant="tonal"
					prepend-icon="sticky-note"
					@click="onStatusFilter('distributed')"
					@keydown.enter.prevent
				>
					{{ $t('Distributed') }}
				</v-btn>

				<v-btn
					:class="invalidatedButtonClass"
					variant="tonal"
					prepend-icon="sticky-note"
					@click="onStatusFilter('invalidated')"
					@keydown.enter.prevent
				>
					{{ $t('Invalidated') }}
				</v-btn>

				<v-btn
					:class="expiredButtonClass"
					variant="tonal"
					prepend-icon="sticky-note"
					@click="onStatusFilter('expired')"
					@keydown.enter.prevent
				>
					{{ $t('Expired') }}
				</v-btn>

				<v-btn
					:class="canceledButtonClass"
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
import ApprovalSystem from "@/components/ApprovalSystem";
import AddBeneficiaryForm from "@/components/Assistance/BeneficiariesList/AddBeneficiaryForm";
import AssignVoucherForm from "@/components/Assistance/BeneficiariesList/AssignVoucherForm";
import EditBeneficiaryForm from "@/components/Assistance/BeneficiariesList/EditBeneficiaryForm";
import InputDistributed from "@/components/Assistance/InputDistributed/index";
import InstitutionForm from "@/components/Beneficiaries/InstitutionForm";
import ButtonAction from "@/components/ButtonAction";
import ConfirmAction from "@/components/ConfirmAction";
import DataGrid from "@/components/DataGrid";
import DataInput from "@/components/Inputs/DataInput";
import ExportControl from "@/components/Inputs/ExportControl";
import Modal from "@/components/Inputs/Modal";
import approvalsHelper from "@/mixins/approvalsHelper";
import assistanceHelper from "@/mixins/assistanceHelper";
import baseHelper from "@/mixins/baseHelper";
import beneficiariesHelper from "@/mixins/beneficiariesHelper";
import grid from "@/mixins/grid";
import permissions from "@/mixins/permissions";
import urlFiltersHelper from "@/mixins/urlFiltersHelper";
import vuetifyHelper from "@/mixins/vuetifyHelper";
import { generateColumns, normalizeText } from "@/utils/datagrid";
import { checkResponseStatus } from "@/utils/fetcher";
import { downloadFile } from "@/utils/helpers";
import { Notification } from "@/utils/UI";
import { ASSISTANCE, EXPORT, GENERAL, INSTITUTION, TABLE } from "@/consts";

const statusTags = [
	{ code: "To distribute", class: "status to-distribute" },
	{ code: "Distributed", class: "status distributed" },
	{ code: "Expired", class: "status expired" },
	{ code: "Invalidated", class: "status invalidated" },
	{ code: "Canceled", class: "status canceled" },
];

export default {
	name: "BeneficiariesList",

	emits: [
		"assistanceUpdated",
		"beneficiariesCounted",
		"fetchAssistanceStatistics",
	],

	components: {
		ApprovalSystem,
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
		ConfirmAction,
	},

	mixins: [
		permissions,
		baseHelper,
		beneficiariesHelper,
		urlFiltersHelper,
		vuetifyHelper,
		assistanceHelper,
		approvalsHelper,
		grid,
	],

	props: {
		addButton: Boolean,
		exportButton: Boolean,

		assistance: {
			type: Object,
			required: true,
		},

		project: {
			type: Object,
			required: true,
		},

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
			isWarningDialogOpenedForInvalidation: false,
			warningMessageForInvalidation: "",
			approvalsList: [],
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
				invalidated: false,
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
			inputDistributedModal: {
				isOpened: false,
				isWaiting: false,
			},
			selectedBnfIdForSmartCardInvalidation: null,
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
			approvalSystemData: {
				isOpened: false,
				actionType: "",
				targetId: null,
				target: null,
				justificationLabel: "",
				warningMessage: "",
				createAction: {
					createButtonName: "",
					confirmTitle: "",
					confirmMessage: "",
				},
				acceptanceAction: {
					approvalId: null,
					isApproveButtonDisabled: false,
					approveButtonName: "",
					rejectButtonName: "",
					confirmTitleForApprove: "",
					confirmTitleForReject: "",
					confirmMessageForApprove: "",
					confirmMessageForReject: "",
					message: "",
				},
			},
			institutionModel: { ...INSTITUTION.DEFAULT_FORM_MODEL },
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
				"text-none ml-3 status to-distribute",
				{ "is-selected": this.statusActive.toDistribute },
			];
		},

		distributedButtonClass() {
			return [
				"text-none ml-3 status distributed",
				{ "is-selected": this.statusActive.distributed },
			];
		},

		invalidatedButtonClass() {
			return [
				"text-none ml-3 status invalidated",
				{ "is-selected": this.statusActive.invalidated },
			];
		},

		expiredButtonClass() {
			return [
				"text-none ml-3 status expired",
				{ "is-selected": this.statusActive.expired },
			];
		},

		canceledButtonClass() {
			return [
				"text-none ml-3 status canceled",
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
				} else {
					this.setGridFilters("assistanceDetail", false);

					if (!this.table.sortColumn?.length) {
						this.setDefaultSortForHouseholdOrIndividual();
					}
				}

				await this.reloadBeneficiariesList();
			}
		},
	},

	async created() {
		if (!this.assistanceDetail) {
			this.setDefaultSortForHouseholdOrIndividual();
		}

		await this.reloadBeneficiariesList();
	},

	async mounted() {
		await this.prepareListOfApprovals();
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

		setDefaultSortForHouseholdOrIndividual() {
			if (this.assistance?.target === ASSISTANCE.TARGET.HOUSEHOLD
				|| this.assistance?.target === ASSISTANCE.TARGET.INDIVIDUAL) {
				this.table.sortColumn = TABLE.DEFAULT_SORT_OPTIONS.ASSISTANCE_EDIT.HOUSEHOLD.key;
				this.table.sortDirection = TABLE.DEFAULT_SORT_OPTIONS.ASSISTANCE_EDIT.HOUSEHOLD.order;
			}
		},

		onStatusFilter(filter, queryValue = "") {
			const filterValue = queryValue.length ? queryValue : filter;
			this.statusActive[filter] = !this.statusActive[filter];

			if (this.selectedFilters.includes(filterValue)) {
				this.selectedFilters = this.selectedFilters.filter((item) => item !== filterValue);
			} else {
				this.selectedFilters.push(filterValue);
			}

			this.onFiltersChange({ reliefPackageStates: this.selectedFilters }, true);
		},

		async onFiltersChange(selectedFilters, forceFetch = false) {
			this.filters = selectedFilters;
			this.table.currentPage = 1;

			if (forceFetch) {
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

			if (this.$refs.beneficiariesList.searchValue()?.length) {
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

		isInvalidateButtonVisible({ status, reliefPackages }) {
			return this.assistance.type === ASSISTANCE.TYPE.DISTRIBUTION
				&& this.assistance.commodities[0]?.modalityType === ASSISTANCE.COMMODITY.SMARTCARD
				&& status[0] === ASSISTANCE.RELIEF_PACKAGES.STATE.DISTRIBUTED
				&& this.userCan.invalidateDistribution
				&& !this.isInvalidationApprovalForReliefPackage(reliefPackages);
		},

		onSetSmartCardAsInvalid(bnfId, reliefPackage) {
			const isAlreadyPartOfAmountSpent = reliefPackage.spent;

			this.isWarningDialogOpenedForInvalidation = isAlreadyPartOfAmountSpent;

			if (isAlreadyPartOfAmountSpent) {
				this.warningMessageForInvalidation = "Part of the distributed amount was already spent. Distribution can't be Invalidated";
			}

			if (!this.isWarningDialogOpenedForInvalidation) {
				this.approvalSystemData = {
					...this.approvalSystemData,
					isModalOpened: true,
					actionType: GENERAL.APPROVAL_SYSTEM.TYPE.CREATE,
					target: GENERAL.APPROVAL_SYSTEM.TARGET.INVALIDATE_RELIEF_PACKAGE,
					targetId: reliefPackage.id,
					justificationLabel: "Note (reason for Invalidation)",
					createAction: {
						createButtonName: "Request for Invalidation",
						title: "Request for Invalidation",
						confirmTitle: "Request for Invalidation",
						confirmMessage: "Do you really want to make request for Invalidation? This is permanent and distribution can not be distributed again.",
					},
				};

				this.selectedBnfIdForSmartCardInvalidation = bnfId;
			}
		},

		onSetApproveInvalidation(bnfId, reliefPackage) {
			const isAlreadyPartOfAmountSpent = reliefPackage.spent;
			const { message, id } = this.approvalsList.find(
				(approval) => approval.targetId === reliefPackage.id,
			);
			const warningMessage = isAlreadyPartOfAmountSpent
				? "Part of the distributed amount was already spent. Distribution can't be Invalidated."
				: "";

			this.approvalSystemData = {
				...this.approvalSystemData,
				isModalOpened: true,
				actionType: GENERAL.APPROVAL_SYSTEM.TYPE.ACCEPTANCE,
				target: GENERAL.APPROVAL_SYSTEM.TARGET.INVALIDATE_RELIEF_PACKAGE,
				targetId: reliefPackage.id,
				justificationLabel: "Note (reason for Invalidation)",
				warningMessage,
				acceptanceAction: {
					approvalId: id,
					isApproveButtonDisabled: !!isAlreadyPartOfAmountSpent,
					approveButtonName: "Approve Invalidation",
					rejectButtonName: "Reject Invalidation",
					title: "Approve Invalidation",
					confirmTitleForApprove: "Approve Invalidation",
					confirmTitleForReject: "Reject Invalidation",
					confirmMessageForApprove: "Do you really want to approve this Invalidation?",
					confirmMessageForReject: "Do you really want to reject this Invalidation?",
					message,
				},
			};

			this.selectedBnfIdForSmartCardInvalidation = bnfId;
		},

		async onSuccessfullyCreatedRequest() {
			if (this.approvalSystemData.target === GENERAL.APPROVAL_SYSTEM
				.TARGET.INVALIDATE_RELIEF_PACKAGE) {
				await this.prepareListOfApprovals();
				await this.fetchData();

				Notification(
					`${this.$t("Successfully requested Invalidation for Beneficiary ID")} ${this.selectedBnfIdForSmartCardInvalidation}`,
					"success",
				);
			}
		},

		async onSuccessfullyApprovedRequest() {
			if (this.approvalSystemData.target === GENERAL.APPROVAL_SYSTEM
				.TARGET.INVALIDATE_RELIEF_PACKAGE) {
				await this.prepareListOfApprovals();
				await this.fetchData();

				this.$emit("fetchAssistanceStatistics");

				Notification(
					`${this.$t("Successfully approved Invalidation for Beneficiary ID")} ${this.selectedBnfIdForSmartCardInvalidation}`,
					"success",
				);
			}
		},

		async onSuccessfullyRejectedRequest() {
			if (this.approvalSystemData.target === GENERAL.APPROVAL_SYSTEM
				.TARGET.INVALIDATE_RELIEF_PACKAGE) {
				await this.prepareListOfApprovals();

				Notification(
					`${this.$t("Successfully rejected Invalidation for Beneficiary ID")} ${this.selectedBnfIdForSmartCardInvalidation}`,
					"success",
				);
			}
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
				case ASSISTANCE.TARGET.INSTITUTION:
					try {
						const sort = this.table.sortColumn !== ""
							? `${this.table.sortColumn?.sortKey || this.table.sortColumn}.${this.table.sortDirection}`
							: "";
						const {
							data: { data, totalCount },
							status,
							message,
						} = await AssistancesService
							.getListOfInstitutions({
								id: this.$route.params.assistanceId,
								page: page || this.table.currentPage,
								size: size || this.perPage,
								filters: this.filters,
								sort,
							});

						checkResponseStatus(status, message);

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
						const sort = this.table.sortColumn !== ""
							? `${this.table.sortColumn?.sortKey || this.table.sortColumn}.${this.table.sortDirection}`
							: "";

						const {
							data: { data, totalCount },
							status,
							message,
						} = await AssistancesService
							.getOptimizedListOfBeneficiaries({
								id: this.$route.params.assistanceId,
								page: page || this.table.currentPage,
								size: size || this.perPage,
								filters: this.filters,
								sort,
								search,
							});

						checkResponseStatus(status, message);

						this.table.data = [];
						this.table.progress = 0;
						this.$emit("beneficiariesCounted", totalCount);
						this.table.total = totalCount;

						if (totalCount > 0) {
							await this.prepareDataForTable(data);
						}
					} catch (e) {
						Notification(`${this.$t("Beneficiaries")}: ${e.message || e}`, "error");
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

			switch (this.assistance.target) {
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
							const lastModified = reliefPackages.map((rp) => this.$moment.utc(
								rp.lastModified || rp.lastModified,
							).format("YYYY-MM-DD HH:mm"));
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
								selectable: !isDistributed && !isCanceled && !this.isAssistanceClosed,
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
						const givenName = this.prepareName(
							beneficiary.localGivenName,
							beneficiary.enGivenName,
						);
						const familyName = this.prepareName(
							beneficiary.localFamilyName,
							beneficiary.enFamilyName,
						);
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
							(rp) => (this.$moment.utc(
								rp.lastModified || rp.lastModified,
							).format("YYYY-MM-DD HH:mm")),
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
							selectable: !isDistributed && !isCanceled && !this.isAssistanceClosed,
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

		async prepareListOfApprovals() {
			if (this.assistanceDetail) {
				this.setAssignedReliefPackages();

				this.approvalsList = await this.fetchListOfApprovals({
					filters: {
						targetData: [{ assistanceId: this.$route.params.assistanceId }],
						approvalTargets: [GENERAL.APPROVAL_SYSTEM.TARGET.INVALIDATE_RELIEF_PACKAGE],
						states: [GENERAL.APPROVAL_SYSTEM.STATE.REQUESTED],
					},
				});
			}
		},

		isInvalidationApprovalForReliefPackage(reliefPackages) {
			const reliefPackageIds = new Set(reliefPackages.map((reliefPackage) => reliefPackage.id));

			return this.approvalsList.filter(
				(approval) => reliefPackageIds.has(approval.targetId)
					&& approval.approvalTarget === GENERAL.APPROVAL_SYSTEM.TARGET.INVALIDATE_RELIEF_PACKAGE,
			).length;
		},

		isInvalidationApprovalVisible(reliefPackages) {
			return this.isInvalidationApprovalForReliefPackage(reliefPackages)
				&& this.userCan.invalidateDistributionApprove;
		},

		async onRecalculate() {
			try {
				this.isRecalculationLoading = true;

				const {
					message,
					status,
				} = await BeneficiariesService.recalculateReliefPackages(
					this.assistance.id,
				);

				checkResponseStatus(status, message);

				this.$emit("assistanceUpdated");
				await this.reloadBeneficiariesList();
				this.$emit("fetchAssistanceStatistics");

				Notification(this.$t("Assistance Successfully Recalculated"), "success");
			} catch (e) {
				Notification(`${this.$t("Recalculation")}: ${e.message || e}`, "error");
			} finally {
				this.isRecalculationLoading = false;
			}
		},

		async onSetAsNotDistributed(tableIndex, bnfId, reliefPackage) {
			try {
				const {
					data,
					status,
					message,
				} = await AssistancesService.revertDistributionOfReliefPackage(
					reliefPackage[0].id,
				);

				checkResponseStatus(status, message);

				Notification(
					`${this.$t("Successfully set as not distributed for Beneficiary ID")} ${bnfId}`,
					"success",
				);

				const updatedRow = {
					status: [data.state],
					distributed: [`${data.distributed} ${data.unit}`],
					lastModified: [this.$moment.utc(data.lastModified).format("YYYY-MM-DD HH:mm")],
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

		async getBeneficiaries(ids, filters) {
			try {
				const {
					data: { data },
					status,
					message,
				} = await BeneficiariesService.getBeneficiaries({
					ids,
					filters,
				});

				checkResponseStatus(status, message);

				return data;
			} catch (e) {
				Notification(`${this.$t("Beneficiaries")}: ${e.message || e}`, "error");
			}

			return [];
		},

		async fetchBnfFile3Statistics(bnfFile3ExportId) {
			try {
				const {
					data,
					status,
					message,
				} = await BeneficiariesService.getBnfFile3ExportStatistics(
					bnfFile3ExportId,
				);

				checkResponseStatus(status, message);

				this.bnfFile3Statistics = data;
			} catch (e) {
				Notification(`${this.$t("BNF File 3 Statistics")}: ${e.message || e}`, "error");
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
						const {
							data,
							status,
							message,
						} = await BeneficiariesService.exportBnf3File({
							bnfFile3Id: this.assistance.bnfFile3ExportId,
							format,
						});

						downloadFile(data, filename, status, format, message);
					} catch (e) {
						Notification(`${this.$t("BNF File 3 Export")}: ${e.message || e}`, "error");
					}
				} else if (exportType === EXPORT.INSTITUTIONS) {
					try {
						const filters = { assistanceId: this.assistance.id };
						const {
							data,
							status,
							message,
						} = await InstitutionService.exportInstitutions({
							format,
							filters,
						});

						downloadFile(data, filename, status, format, message);
					} catch (e) {
						Notification(`${this.$t("Institutions Export")}: ${e.message || e}`, "error");
					}
				} else {
					try {
						const sort = `${this.table.sortColumn?.sortKey
							|| this.table.sortColumn}.${this.table.sortDirection}`;
						const {
							data,
							status,
							message,
						} = await BeneficiariesService.exportAssistanceBeneficiaries({
							assistanceId: this.$route.params.assistanceId,
							search: this.table.searchPhrase,
							...(exportType !== EXPORT.HOUSEHOLDS && { sort }),
							format,
							exportType,
						});

						downloadFile(data, filename, status, format, message);
					} catch (e) {
						Notification(`${this.$t("Export")}: ${e.message || e}`, "error");
					}
				}
			} else {
				try {
					const {
						data,
						status,
						message,
					} = await BeneficiariesService.exportBeneficiaries({
						ids: this.table.data,
						idsParam: "id",
						format,
					});

					downloadFile(data, filename, status, format, message);
				} catch (e) {
					Notification(`${this.$t("Export")}: ${e.message || e}`, "error");
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

.card-icon {
	position: absolute;
}
</style>
