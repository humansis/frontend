import AssistancesService from "@/services/AssistancesService";
import { Notification, Toast } from "@/utils/UI";
import BeneficiariesService from "@/services/BeneficiariesService";
import consts from "@/utils/assistanceConst";
import AddressService from "@/services/AddressService";

export default {
	methods: {
		/** @summary Setting the BNF if the MOBILE MONEY was already distributed to him */
		async setAssignedTransactions(transactionIds) {
			const transactionStatuses = await this.getTransactionStatuses();
			const transactions = await this.getTransactions(transactionIds);

			this.table.data.map(async (item, key) => {
				const transaction = transactions?.find(({ id }) => id === item.transactionIds[0]);

				this.table.data[key].status = transaction?.status ? transactionStatuses
					?.find(({ code }) => code === transaction.status)?.value : this.$t("Not Sent");
				this.table.data[key].value = transaction?.amountSent || `
						${this.commodities[0].value} ${this.commodities[0].unit}`;
			});

			this.table.settings = {
				assignVoucherAction: false,
				checkableTable: false,
			};

			this.table.progress += 25;
		},

		/** @summary Obtaining information about the beneficiary MOBILE MONEY */
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

		/** @summary Setting the BNF if the SMART CARD was already distributed to him */
		async setAssignedSmartCards(smartcardDepositIds) {
			const smartCardDeposits = await this.getSmartCardDeposits(smartcardDepositIds);

			this.table.data.map(async (item, key) => {
				const smartCardDeposit = smartCardDeposits
					?.find(({ id }) => id === item.smartcardDepositIds[0]);

				this.table.data[key].distributed = smartCardDeposit?.dateOfDistribution
					? this.$moment(smartCardDeposit.dateOfDistribution)
						.format("YYYY-MM-DD hh:mm")
					: this.$t("Not Distributed");
				this.table.data[key].value = `
						${smartCardDeposits[0].value} ${this.commodities[0].unit}`;
			});

			this.table.settings = {
				assignVoucherAction: false,
				checkableTable: false,
			};

			this.table.progress += 25;
		},

		/** @summary Obtaining information about the beneficiary SMART CARD */
		getSmartCardDeposits(smartcardDepositIds) {
			return AssistancesService
				.getSmartCardDepositsForAssistance(smartcardDepositIds).then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Smartcard Deposit")} ${e}`, "is-danger");
				});
		},

		/** @summary Setting the BNF if the QR VOUCHER CODE was already distributed to him */
		async setAssignedBooklets(bookletIds) {
			const bookletStatuses = await this.getBookletStatuses();
			const booklets = await this.getBooklets(bookletIds);

			this.table.data.map(async (item, key) => {
				const booklet = booklets?.find(({ id }) => id === item.bookletIds[0]);
				console.log(booklet);

				// TODO Decide if voucher can be sent
				this.table.data[key].canAssignVoucher = true;

				this.table.data[key].booklet = booklet?.code || this.$t("None");

				this.table.data[key].status = booklet?.status ? bookletStatuses
					?.find(({ code }) => code === booklet.status)?.value : this.$t("Not Distributed");

				this.table.data[key].used = booklet?.quantityOfUsedVouchers
					? `${booklet.quantityOfUsedVouchers}/${booklet.quantityOfVouchers}`
					: this.$t("None");

				this.table.data[key].value = booklet?.totalValue
					? `${booklet.totalValue} ${booklet.currency}` : this.$t("None");
			});

			this.table.settings = {
				assignVoucherAction: true,
				checkableTable: false,
			};

			this.table.progress += 25;
		},

		/** @summary Obtaining information about the beneficiary QR VOUCHER CODE */
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

		/** @summary Setting the BNF that the QR VOUCHER CODE is now distributed to him */
		async assignBookletToBeneficiary(booklet) {
			this.assignVoucherModal.isWaiting = true;

			await AssistancesService.assignBookletForBeneficiaryInAssistance(
				this.$route.params.assistanceId,
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

		/** @summary Setting the BNF if the GENERAL RELIEF ITEMS was already distributed to him */
		async setAssignedGeneralRelief(generalReliefItemIds) {
			const generalReliefItems = await this.getGeneralReliefItems(generalReliefItemIds);

			this.table.data.map(async (item, key) => {
				const generalReliefItem = generalReliefItems
					?.find(({ id }) => id === item.generalReliefItemIds[0]);

				this.table.data[key].distributed = generalReliefItem.dateOfDistribution
					? this.$moment(generalReliefItem.dateOfDistribution).format("YYYY-MM-DD hh:mm")
					: this.$t("Not Distributed");

				this.table.data[key].value = `${this.commodities[0].value} ${this.commodities[0].unit}`;

				if (generalReliefItem.distributed) this.table.checkedRows.push(this.table.data[key]);
			});

			this.table.settings = {
				assignVoucherAction: false,
				checkableTable: true,
			};

			this.table.progress += 25;
		},

		/** @summary Obtaining information about the beneficiary GENERAL RELIEF */
		getGeneralReliefItems(generalReliefItemIds) {
			return AssistancesService
				.getGeneralReliefItemsForAssistance(
					generalReliefItemIds,
				).then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t("General Relief")} ${e}`, "is-danger");
				});
		},

		async preparePhoneForTable(phoneIds) {
			const phones = await this.getPhones(phoneIds);
			this.table.progress += 15;
			this.table.data.forEach((item, key) => {
				this.table.data[key].phone = !item.phoneIds.length
					? this.$t("None")
					: this.prepareEntityForTable(item.phoneIds[0], phones,
						"number", "None");
			});
			this.table.progress += 15;
		},

		async prepareNationalIdForTable(ids) {
			const nationalIds = await this.getNationalIds(ids);
			this.table.progress += 20;
			this.table.data.map(async (item, key) => {
				this.table.data[key].nationalId = !item.nationalIds.length
					? this.$t("None")
					: this.prepareEntityForTable(item.nationalIds[0],
						nationalIds, "number", "None");
			});
			this.table.progress += 15;
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

		openAddBeneficiaryModal(id) {
			this.addBeneficiaryModel.removingId = id;
			this.addBeneficiaryModal.isOpened = true;
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
			// TODO Update Beneficiary in this assistance
			this.beneficiaryModal = {
				isOpened: false,
				isEditing: false,
			};
			await this.reloadBeneficiariesList();
		},

		async submitEditInstitutionForm() {
			// TODO Update Institution in this assistance
			this.institutionModal = {
				isOpened: false,
				isEditing: false,
			};
			await this.reloadBeneficiariesList();
		},

		async submitEditCommunityForm() {
			// TODO Update Community in this assistance
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
