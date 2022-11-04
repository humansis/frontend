import AssistancesService from "@/services/AssistancesService";
import { Notification, Toast } from "@/utils/UI";
import BeneficiariesService from "@/services/BeneficiariesService";
import consts from "@/utils/assistanceConst";
import AddressService from "@/services/AddressService";

export default {
	methods: {
		getTransactions(transactionIds) {
			return AssistancesService
				.getTransactionsForAssistance(
					transactionIds,
				).then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Transactions")} ${e}`, "is-danger");
				});
		},

		getTransactionStatuses() {
			return AssistancesService
				.getTransactionStatuses().then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Transaction Statuses")} ${e}`, "is-danger");
				});
		},

		getSmartCardDeposits(smartcardDepositIds) {
			return AssistancesService
				.getSmartCardDepositsForAssistance(smartcardDepositIds).then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Smartcard Deposit")} ${e}`, "is-danger");
				});
		},

		getBooklets(bookletIds) {
			return AssistancesService
				.getBookletsForAssistance(
					bookletIds,
				).then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Booklets")} ${e}`, "is-danger");
				});
		},

		getBookletStatuses() {
			return AssistancesService
				.getBookletStatuses().then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Booklet Statuses")} ${e}`, "is-danger");
				});
		},

		async assignBookletToBeneficiary(booklet) {
			this.assignVoucherModal.isWaiting = true;
			let target = "";

			switch (this.assistance.target) {
				case consts.TARGET.COMMUNITY:
					target = "communities";
					break;
				case consts.TARGET.INSTITUTION:
					target = "institutions";
					break;
				case consts.TARGET.HOUSEHOLD:
				case consts.TARGET.INDIVIDUAL:
				default:
					target = "beneficiaries";
			}

			await AssistancesService.assignBookletInAssistance(
				this.$route.params.assistanceId,
				target,
				booklet.beneficiaryId,
				booklet.code,
			).then(({ status }) => {
				if (status === 200) {
					Toast(
						`${this.$t("Success for Beneficiary")} ${booklet.beneficiaryId}`,
						"is-success",
					);
					this.closeAssignVoucherModal();
				}
			}).catch((e) => {
				if (e.message) {
					Notification(
						`${this.$t("Error for Beneficiary")} ${booklet.beneficiaryId} ${e}`,
						"is-danger",
					);
				}
				this.closeAssignVoucherModal();
			});

			this.assignVoucherModal.isWaiting = false;
		},

		async setAssignedReliefPackages(reliefPackageIds) {
			const reliefPackages = reliefPackageIds.length
				? await this.getReliefPackages(reliefPackageIds) : [];

			this.table.data.map(async (item, key) => {
				const reliefPackageItems = reliefPackages
					?.filter(({ id }) => item.reliefPackageIds.includes(id));

				this.table.data[key].status = reliefPackageItems.map((i) => (i.state));
				this.table.data[key].toDistribute = reliefPackageItems.map((i) => (`${i.amountToDistribute} ${i.unit}`));
				this.table.data[key].distributed = reliefPackageItems.map((i) => (`${i.amountDistributed} ${i.unit}`));
				this.table.data[key].lastModified = reliefPackageItems
					.map((i) => (this.$moment(i.distributedAt || i.lastModifiedAt)
						.format("YYYY-MM-DD hh:mm")));
				this.table.data[key].spent = reliefPackageItems.map((i) => (`${i.amountSpent ?? 0} ${i.unit}`));

				const isDistributed = reliefPackageItems.length
					&& reliefPackageItems.every((i) => i.state === "Distributed");
				if (isDistributed) this.table.checkedRows.push(this.table.data[key]);
			});

			const modality = this.commodities[0]?.modalityType;

			const isTableCheckable = modality !== consts.COMMODITY.SMARTCARD
				&& modality !== consts.COMMODITY.QR_CODE_VOUCHER
				&& modality !== consts.COMMODITY.MOBILE_MONEY;

			this.table.settings = {
				assignVoucherAction: modality === consts.COMMODITY.QR_CODE_VOUCHER,
				checkableTable: isTableCheckable,
			};

			this.table.progress = 100;
		},

		getReliefPackages(reliefPackageIds) {
			return AssistancesService
				.getReliefPackagesForAssistance(
					this.$route.params.assistanceId,
					reliefPackageIds,
				).then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Relief Packages")} ${e}`, "is-danger");
				});
		},

		async preparePhoneForTable(phoneIds) {
			const phones = await this.getPhones(phoneIds);
			this.table.data.forEach((item, key) => {
				this.table.data[key].phone = !item.phoneIds.length
					? this.$t("None")
					: this.preparePhonesForTable(item.phoneIds, phones, "None");
			});
			this.table.progress += 15;
		},

		async prepareNationalIdForTable(ids) {
			const nationalIds = await this.getNationalIds(ids);
			this.table.data.map(async (item, key) => {
				this.table.data[key].nationalId = !item.nationalIds.length
					? this.$t("None")
					: this.prepareNationalIdsValuesForTable(item.nationalIds, nationalIds);
			});
			this.table.progress += 15;
		},

		prepareNationalIdsValuesForTable(ids, entities) {
			const nationalIds = this.prepareEntityForTable(ids, entities, "number", "None");
			const nationalType = this.prepareEntityForTable(ids, entities, "type", "None");

			const primary = nationalIds[0] ? `${this.$t(nationalType[0])} : <b>${nationalIds[0]}</b>` : "";
			const secondary = nationalIds[1] ? `${this.$t(nationalType[1])} : <b>${nationalIds[1]}</b>` : "";
			const tertiary = nationalIds[2] ? `${this.$t(nationalType[2])} : <b>${nationalIds[2]}</b>` : "";

			return `${primary} <br> ${secondary} <br> ${tertiary}`;
		},

		prepareGender(gender) {
			return gender === "F" ? this.$t("Female") : this.$t("Male");
		},

		async getNationalIds(ids) {
			if (!ids.length) return [];
			return BeneficiariesService.getNationalIds(ids)
				.then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t("National IDs")} ${e}`, "is-danger");
				});
		},

		async getPhones(ids) {
			if (!ids.length) return [];
			return BeneficiariesService.getPhones(ids)
				.then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Phones")} ${e}`, "is-danger");
				});
		},

		async getAssistanceCommodities() {
			await AssistancesService.getAssistanceCommodities(this.$route.params.assistanceId)
				.then(({ data }) => { this.commodities = data; })
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Commodities")} ${e}`, "is-danger");
				});
		},

		openAssignVoucherModal(id, canAssignVoucher) {
			if (canAssignVoucher) {
				this.assignVoucherToBeneficiaryId = this.table.data.find((item) => item.id === id);
				this.assignVoucherModal.isOpened = true;
			}
		},

		closeAssignVoucherModal() {
			this.assignVoucherModal.isOpened = false;
		},

		openAddBeneficiaryModal(id, canBeOpened) {
			if (canBeOpened) {
				this.addBeneficiaryModel.removingId = id;
				this.addBeneficiaryModal.isOpened = true;
			}
		},

		closeAddBeneficiaryModal() {
			this.addBeneficiaryModal.isOpened = false;
		},

		showDetail(beneficiary) {
			switch (this.assistance.target) {
				case consts.TARGET.COMMUNITY:
					this.showCommunityDetail(beneficiary);
					break;
				case consts.TARGET.INSTITUTION:
					this.showInstitutionDetail(beneficiary);
					break;
				case consts.TARGET.HOUSEHOLD:
				case consts.TARGET.INDIVIDUAL:
				default:
					this.showBeneficiaryDetail(beneficiary);
			}
		},

		showEdit({ id }) {
			switch (this.assistance.target) {
				case consts.TARGET.COMMUNITY:
					this.showCommunityEdit(id);
					break;
				case consts.TARGET.INSTITUTION:
					this.showInstitutionEdit(id);
					break;
				case consts.TARGET.HOUSEHOLD:
				case consts.TARGET.INDIVIDUAL:
				default:
					this.showBeneficiaryEdit(id);
			}
		},

		showBeneficiaryDetail(beneficiary) {
			this.beneficiaryModel = {
				...beneficiary,
				dateOfBirth: new Date(beneficiary.dateOfBirth),
			};
			this.beneficiaryModal = {
				isOpened: true,
				isEditing: false,
			};
		},

		async showInstitutionDetail(institution) {
			this.institutionModal = {
				isOpened: true,
				isEditing: false,
				isWaiting: true,
			};

			const address = institution?.addressId ? await this.getAddress(institution.addressId) : {};

			this.institutionModel = {
				addressStreet: address?.street,
				addressNumber: address?.number,
				addressPostCode: address?.postcode,
			};

			this.institutionModal.isWaiting = false;
		},

		async showCommunityDetail(community) {
			this.communityModal = {
				isOpened: true,
				isEditing: false,
				isWaiting: true,
			};

			const address = community?.addressId ? await this.getAddress(community.addressId) : {};

			this.communityModel = {
				addressStreet: address?.street,
				addressNumber: address?.number,
				addressPostCode: address?.postcode,
			};

			this.communityModal.isWaiting = false;
		},

		showBeneficiaryEdit(id) {
			const beneficiary = this.table.data.find((item) => item.id === id);
			this.beneficiaryModel = {
				...beneficiary,
				dateOfBirth: new Date(beneficiary.dateOfBirth),
			};
			this.beneficiaryModal = {
				isOpened: true,
				isEditing: true,
			};
		},

		async showInstitutionEdit(id) {
			this.institutionModal = {
				isOpened: true,
				isEditing: true,
				isWaiting: true,
			};

			const institution = this.table.data.find((item) => item.id === id);
			const address = institution?.addressId ? await this.getAddress(institution.addressId) : {};

			this.institutionModel = {
				addressStreet: address?.street,
				addressNumber: address?.number,
				addressPostCode: address?.postcode,
			};

			this.institutionModal.isWaiting = false;
		},

		async showCommunityEdit(id) {
			this.communityModal = {
				isOpened: true,
				isEditing: true,
				isWaiting: true,
			};

			const community = this.table.data.find((item) => item.id === id);
			const address = community?.addressId ? await this.getAddress(community.addressId) : {};

			this.communityModel = {
				addressStreet: address?.street,
				addressNumber: address?.number,
				addressPostCode: address?.postcode,
			};

			this.communityModal.isWaiting = false;
		},

		closeBeneficiaryModal() {
			this.beneficiaryModal = {
				isOpened: false,
				isEditing: false,
			};
		},

		closeInstitutionModal() {
			this.institutionModal = {
				isOpened: false,
				isEditing: false,
			};
		},

		closeCommunityModal() {
			this.communityModal = {
				isOpened: false,
				isEditing: false,
			};
		},

		onRowsCheck(rows) {
			this.$emit("rowsChecked", rows);
		},

		async randomSample() {
			const size = Math.round(this.table.total * (this.randomSampleSize / 100));
			const randomPage = this.rnd(1, this.table.total / size);
			this.table.customPerPage = size;
			await this.fetchData(randomPage, size);
		},

		rnd(a, b) {
			return Math.floor((b - a + 1) * Math.random()) + a;
		},

		async submitEditBeneficiaryForm() {
			this.beneficiaryModal = {
				isOpened: false,
				isEditing: false,
			};
			await this.reloadBeneficiariesList();
		},

		async submitEditInstitutionForm() {
			this.institutionModal = {
				isOpened: false,
				isEditing: false,
			};
			await this.reloadBeneficiariesList();
		},

		async submitEditCommunityForm() {
			this.communityModal = {
				isOpened: false,
				isEditing: false,
			};
			await this.reloadBeneficiariesList();
		},

		async onPageChange(currentPage) {
			this.table.currentPage = currentPage;
			await this.reloadBeneficiariesList();
		},

		async onSort(column) {
			const currentColumn = this.table.visibleColumns.find(({ key }) => key === column);
			const sortKey = currentColumn.sortKey || column;

			if (this.table.sortColumn === sortKey) {
				this.table.sortDirection = this.table.sortDirection === "asc" ? "desc" : "asc";
			} else {
				this.table.sortColumn = sortKey;
				this.table.sortDirection = "desc";
			}
			await this.reloadBeneficiariesList();
		},

		async onSearch(value) {
			this.table.searchPhrase = value;
			await this.reloadBeneficiariesList();
		},

		async onChangePerPage() {
			await this.reloadBeneficiariesList();
		},

		async resetSort() {
			if (this.table.sortColumn !== "" || this.table.sortDirection !== "") {
				this.table.sortColumn = "";
				this.table.sortDirection = "";
				await this.reloadBeneficiariesList();
			}
		},

		getAddress(id) {
			return AddressService.getAddress(id)
				.then((response) => response);
		},
	},
};
