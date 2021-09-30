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
		<div class="buttons space-between">
			<b-button
				v-if="addButton && userCan.editDistribution"
				type="is-primary"
				icon-left="plus"
				@click="openAddBeneficiaryModal(null, true)"
			>
				{{ $t('Add') }}
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
			:checkable="table.settings.checkableTable"
			:checked-rows="table.checkedRows"
			:row-class="(row) => row.removed && 'removed-row'"
			@clicked="showDetail"
			@pageChanged="onPageChange"
			@sorted="onSort"
			@changePerPage="onChangePerPage"
			@resetSort="resetSort"
			@search="onSearch"
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
				<ExportButton
					v-if="exportButton && userCan.exportBeneficiaries"
					type="is-primary"
					:loading="exportLoading"
					:formats="{ xlsx: true, csv: true, ods: true, pdf: true}"
					@onExport="exportData"
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
						v-if="userCan.editDistribution"
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
import ExportButton from "@/components/ExportButton";
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

export default {
	name: "BeneficiariesList",

	props: {
		assistance: Object,
		project: Object,
		isAssistanceDetail: Boolean,
		addButton: Boolean,
		changeButton: {
			type: Boolean,
			default: false,
		},
		exportButton: Boolean,
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
		ExportButton,
		ColumnField,
	},

	mixins: [permissions, baseHelper, beneficiariesHelper],

	data() {
		return {
			isLoadingList: false,
			exportLoading: false,
			advancedSearchVisible: false,
			commodities: [],
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
				householdsAndIndividualDetailColumns: [
					{ key: "id", label: "Beneficiary ID", sortable: true },
					{ key: "givenName", label: "First Name", sortable: true, sortKey: "localGivenName" },
					{ key: "familyName", label: "Family Name", sortable: true, sortKey: "localFamilyName" },
					{ key: "nationalId", label: "National ID", sortable: true },
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

		isAssistanceCompleted() {
			return this.assistance?.completed;
		},
	},

	async created() {
		await this.getAssistanceCommodities();
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
				await this.fetchData();
			}
		},

		addedOrRemovedBeneficiary() {
			this.$emit("assistanceUpdated");
			this.reloadBeneficiariesList();
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
					baseColumns = this.isAssistanceDetail
						? this.table.householdsAndIndividualDetailColumns
						: this.table.householdsAndIndividualEditColumns;
			}

			if (this.isAssistanceDetail && this.assistance.type === consts.TYPE.DISTRIBUTION) {
				switch (this.commodities[0]?.modalityType) {
					case consts.COMMODITY.MOBILE_MONEY:
						additionalColumns = [
							{ key: "phone" },
							{ key: "status" },
							{ key: "value" },
						];
						break;
					case consts.COMMODITY.QR_CODE_VOUCHER:
						additionalColumns = [
							{ key: "booklet" },
							{ key: "status" },
							{ key: "used" },
							{ key: "value" },
						];
						break;
					case consts.COMMODITY.SMARTCARD:
					default:
						/** @summary For commodity type GENERAL RELIEF and SMART CARD */
						additionalColumns = [
							{ key: "distributed" },
							{ key: "value" },
						];
				}
			}

			if (this.isAssistanceDetail && this.assistance.type === consts.TYPE.ACTIVITY) {
				additionalColumns = [
					{ key: "distributed" },
					{ key: "value" },
				];
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
				bookletIds: [],
				generalReliefItemIds: [],
				smartcardDepositIds: [],
				transactionIds: [],
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

						if (item.bookletIds.length) {
							distributionItems.bookletIds.push(item.bookletIds[0]);
						}
						if (item.generalReliefItemIds.length) {
							distributionItems.generalReliefItemIds.push(item.generalReliefItemIds[0]);
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

						if (item.bookletIds.length) {
							distributionItems.bookletIds.push(item.bookletIds[0]);
						}

						if (item.generalReliefItemIds.length) {
							distributionItems.generalReliefItemIds.push(item.generalReliefItemIds[0]);
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

						if (item.bookletIds.length) {
							distributionItems.bookletIds.push(item.bookletIds);
						}
						if (item.generalReliefItemIds.length) {
							distributionItems.generalReliefItemIds.push(item.generalReliefItemIds[0]);
						}
						if (item.smartcardDepositIds.length) {
							distributionItems.smartcardDepositIds.push(item.smartcardDepositIds[0]);
						}
						if (item.transactionIds.length) {
							distributionItems.transactionIds.push(item.transactionIds[0]);
						}
					});

					this.table.data = [...this.table.data];

					this.preparePhoneForTable(phoneIds);
					this.prepareNationalIdForTable(nationalIdIds);
			}

			if (this.isAssistanceDetail && this.assistance.type === consts.TYPE.DISTRIBUTION) {
				await this.settingOfBeneficiariesDistribution(distributionItems);
			}

			if (this.isAssistanceDetail && this.assistance.type === consts.TYPE.ACTIVITY) {
				await this.settingOfBeneficiariesActivity(distributionItems);
			}

			if (!this.isAssistanceDetail) {
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

		settingOfBeneficiariesDistribution(
			{ bookletIds, generalReliefItemIds, smartcardDepositIds, transactionIds },
		) {
			switch (this.commodities[0].modalityType) {
				case consts.COMMODITY.SMARTCARD:
					this.setAssignedSmartCards(smartcardDepositIds);
					break;
				case consts.COMMODITY.MOBILE_MONEY:
					this.setAssignedTransactions(transactionIds);
					break;
				case consts.COMMODITY.QR_CODE_VOUCHER:
					this.setAssignedBooklets(bookletIds);
					break;
				default:
					this.setAssignedGeneralRelief(generalReliefItemIds);
			}
		},

		settingOfBeneficiariesActivity({ generalReliefItemIds }) {
			this.setAssignedGeneralRelief(generalReliefItemIds);
		},

		async exportData(format) {
			this.exportLoading = true;
			if (!this.changeButton) {
				await BeneficiariesService.exportAssistanceBeneficiaries(
					format, this.$route.params.assistanceId,
				)
					.then(({ data }) => {
						const blob = new Blob([data], { type: data.type });
						const link = document.createElement("a");
						link.href = window.URL.createObjectURL(blob);
						link.download = `beneficiaries.${format}`;
						link.click();
					})
					.catch((e) => {
						if (e.message) Notification(`${this.$t("Export Beneficiaries")} ${e}`, "is-danger");
					});
			} else {
				await BeneficiariesService.exportBeneficiaries(format, this.table.data, "id")
					.then(({ data }) => {
						const blob = new Blob([data], { type: data.type });
						const link = document.createElement("a");
						link.href = window.URL.createObjectURL(blob);
						link.download = `beneficiaries.${format}`;
						link.click();
					})
					.catch((e) => {
						if (e.message) Notification(`${this.$t("Export Beneficiaries")} ${e}`, "is-danger");
					});
			}
			this.exportLoading = false;
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
