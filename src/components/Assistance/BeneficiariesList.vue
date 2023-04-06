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
			has-reset-sort
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
			@clicked="showDetail"
			@pageChanged="onPageChange"
			@sorted="onSort"
			@changePerPage="onChangePerPage"
			@resetSort="resetSort"
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
			<template #export>
				<ExportControl
					:disabled="!table.data.length || !userCan.exportBeneficiaries"
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
import AssistancesService from "@/services/AssistancesService";
import { Notification } from "@/utils/UI";
import { generateColumns } from "@/utils/datagrid";
import BeneficiariesService from "@/services/BeneficiariesService";
import baseHelper from "@/mixins/baseHelper";
import consts from "@/utils/assistanceConst";
import AssignVoucherForm from "@/components/Assistance/BeneficiariesList/AssignVoucherForm";
import beneficiariesHelper from "@/mixins/beneficiariesHelper";
import permissions from "@/mixins/permissions";
import InputDistributed from "@/components/Assistance/InputDistributed/index";
import ExportControl from "@/components/Export";
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
		isFetchEnabled: {
			type: Boolean,
			default: false,
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

	mixins: [permissions, baseHelper, beneficiariesHelper],

	data() {
		return {
			isLoadingList: false,
			advancedSearchVisible: false,
			exportControl: {
				loading: false,
				location: "assistance",
				formats: [EXPORT.FORMAT_XLSX, EXPORT.FORMAT_CSV, EXPORT.FORMAT_ODS],
			},
			alreadyFetched: false,
			table: {
				data: [],
				columns: [],
				total: 0,
				currentPage: 1,
				sortDirection: "",
				sortColumn: "",
				searchPhrase: "",
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
					{ key: "givenName", label: "First Name", sortable: true, sortKey: "localGivenName" },
					{ key: "familyName", sortable: true, sortKey: "localFamilyName" },
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

	computed: {
		...mapState(["perPage"]),

		availableExportTypes() {
			if (this.exportButton && this.isDistributionExportVisible
				&& this.userCan.exportBeneficiaries && this.isAssistanceValidated) {
				return [
					EXPORT.LIST_OF_BENEFICIARIES,
					EXPORT.DISTRIBUTION_LIST,
					EXPORT.BANK_DISTRIBUTION_LIST,
				];
			}

			if (this.exportButton && this.userCan.exportBeneficiaries) {
				return [
					EXPORT.LIST_OF_BENEFICIARIES,
					EXPORT.DISTRIBUTION_LIST,
				];
			}

			return [];
		},

		householdsAndIndividualDetailColumns() {
			const baseColumns = [
				{ key: "id", label: "Beneficiary ID", sortable: true },
				{ key: "givenName", label: "First Name", sortable: true, sortKey: "localGivenName" },
				{ key: "familyName", label: "Family Name", sortable: true, width: "190px", sortKey: "localFamilyName" },
				{ key: "nationalId", label: "ID Number", sortable: true },
				{ key: "status", type: "tagArray", customTags: statusTags },
				{ key: "toDistribute", type: "arrayTextBreak" },
				{ key: "distributed", type: "arrayTextBreak" },
				{ key: "spent", type: "arrayTextBreak" },
				{ key: "lastModified", type: "arrayTextBreak" },
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
	},

	async created() {
		await this.reloadBeneficiariesList(false);
	},

	watch: {
		async assistance(newAssistance) {
			if (newAssistance) {
				await this.reloadBeneficiariesList();
			}
		},
	},

	methods: {
		async reloadBeneficiariesList(emit = true) {
			if (this.assistance) {
				if (emit) this.$emit("beneficiariesReloaded", this);
				this.prepareTableColumns();

				if ((this.isFetchEnabled && !this.alreadyFetched) || this.assistanceDetail) {
					this.alreadyFetched = true;
					await this.fetchData();
				}
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
			this.alreadyFetched = false;
			this.$emit("assistanceUpdated");
			this.reloadBeneficiariesList();
		},

		fetchDataAfterBeneficiaryChange() {
			this.alreadyFetched = false;
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
					await AssistancesService.getListOfBeneficiaries(
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
						if (e.message) Notification(`${this.$t("Beneficiaries")} ${e}`, "is-danger");
					});
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
			const vulnerabilitiesList = await this.getVulnerabilities();

			const phoneIds = [];
			const nationalIdIds = [];

			const distributionItems = {
				reliefPackageIds: [],
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

						if (item.reliefPackageIds.length) {
							distributionItems.reliefPackageIds.push(...item.reliefPackageIds);
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

						if (item.reliefPackageIds.length) {
							distributionItems.reliefPackageIds.push(...item.reliefPackageIds);
						}
					});

					this.table.data = [...this.table.data];

					this.table.progress += 55;
					break;
				case consts.TARGET.HOUSEHOLD:
				case consts.TARGET.INDIVIDUAL:
				default:
					beneficiaryIds = data.map((item) => item.beneficiaryId);
					beneficiaries = await this.getBeneficiaries(beneficiaryIds);

					data.forEach((beneficiary, key) => {
						const foundBeneficiary = beneficiaries.find(
							(bnf) => bnf.id === beneficiary.beneficiaryId,
						);

						const item = { ...beneficiary, ...foundBeneficiary };

						this.table.data[key] = item;
						this.table.data[key].givenName = this
							.prepareName(item.localGivenName, item.enGivenName);
						this.table.data[key].familyName = this
							.prepareName(item.localFamilyName, item.enFamilyName);
						this.table.data[key].gender = this.prepareGender(item.gender);
						this.table.data[key].vulnerabilities = vulnerabilitiesList
							?.filter(({ code }) => code === item.vulnerabilityCriteria
								.find((vulnerability) => vulnerability === code));

						if (item.nationalIds.length) nationalIdIds.push(item.nationalIds);
						if (item.phoneIds.length) phoneIds.push(...item.phoneIds);

						if (item.reliefPackageIds.length) {
							distributionItems.reliefPackageIds.push(...item.reliefPackageIds);
						}
					});

					this.table.data = [...this.table.data];

					await this.preparePhoneForTable(phoneIds);
					await this.prepareNationalIdForTable(nationalIdIds);
			}

			if (this.assistanceDetail) {
				await this.setAssignedReliefPackages(distributionItems.reliefPackageIds);
			} else {
				this.table.progress = 100;
			}
		},

		async getVulnerabilities() {
			return BeneficiariesService.getListOfVulnerabilities()
				.then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Vulnerabilities")} ${e}`, "is-danger");
				});
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

		async getBeneficiaries(ids) {
			return BeneficiariesService.getBeneficiaries(ids)
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
				default:
			}
			this.exportControl.loading = false;
		},

		async exportData(format, exportType, filename) {
			if (!this.changeButton) {
				await BeneficiariesService.exportAssistanceBeneficiaries(
					format, this.$route.params.assistanceId,
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
