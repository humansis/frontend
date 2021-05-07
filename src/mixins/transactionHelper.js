import { mapState } from "vuex";
import AssistancesService from "@/services/AssistancesService";
import { Notification } from "@/utils/UI";
import LocationsService from "@/services/LocationsService";
import BeneficiariesService from "@/services/BeneficiariesService";
import ProjectService from "@/services/ProjectService";
import baseHelper from "@/mixins/baseHelper";
import VendorService from "@/services/VendorService";
import ProductService from "@/services/ProductService";

export default {
	mixins: [baseHelper],

	computed: {
		...mapState(["admNames"]),
	},

	methods: {
		renameAdms() {
			const adms = [...Object.keys(this.admNames)];
			this.table.visibleColumns = this.table.visibleColumns.map((item) => {
				const column = { ...item };
				if (adms.includes(column.key)) {
					column.label = this.admNames[column.key];
				}
				return column;
			});
		},

		// Methods for Data Grid
		async prepareProjectForTable(projectIds) {
			const projects = await this.getProjects(projectIds);
			this.table.data.forEach((item, key) => {
				this.table.data[key].project = this.prepareEntityForTable(item.projectId, projects, "name", "None");
			});
			this.table.progress += 10;
			this.reload();
		},

		async prepareAdm1ForTable(adm1Ids) {
			const adm1s = await this.getAdm1s(adm1Ids);
			this.table.data.forEach((item, key) => {
				this.table.data[key].adm1 = this.prepareEntityForTable(item.adm1Id, adm1s, "name", "None");
			});
			this.table.progress += 10;
			this.reload();
		},

		async prepareAdm2ForTable(adm2Ids) {
			const adm2s = await this.getAdm2s(adm2Ids);
			this.table.data.forEach((item, key) => {
				this.table.data[key].adm2 = this.prepareEntityForTable(item.adm2Id, adm2s, "name", "None");
			});
			this.table.progress += 10;
			this.reload();
		},

		async prepareAdm3ForTable(adm3Ids) {
			const adm3s = await this.getAdm3s(adm3Ids);
			this.table.data.forEach((item, key) => {
				this.table.data[key].adm3 = this.prepareEntityForTable(item.adm3Id, adm3s, "name", "None");
			});
			this.table.progress += 10;
			this.reload();
		},

		async prepareAdm4ForTable(adm4Ids) {
			const adm4s = await this.getAdm4s(adm4Ids);
			this.table.data.forEach((item, key) => {
				this.table.data[key].adm4 = this.prepareEntityForTable(item.adm4Id, adm4s, "name", "None");
			});
			this.table.progress += 10;
			this.reload();
		},

		async prepareCommodityForTable(assistanceIds) {
			const commodities = await this.getCommodities(assistanceIds);
			this.table.data.forEach((item, key) => {
				const commodity = this.prepareEntityForTable(item.commodityId, commodities);
				this.table.data[key].commodity = commodity.modalityType;
				this.table.data[key].unit = commodity.unit;
			});
			this.table.progress += 10;
			this.reload();
		},

		async prepareBeneficiaryForTable(beneficiaryIds) {
			const beneficiaries = await this.getBeneficiaries(beneficiaryIds);
			this.table.data.forEach((item, key) => {
				const beneficiary = this.prepareEntityForTable(item.beneficiaryId, beneficiaries);
				if (beneficiary) {
					this.table.data[key].localGivenName = beneficiary.localGivenName;
					this.table.data[key].localFamilyName = beneficiary.localFamilyName;
				}
			});
			this.table.progress += 10;
			this.reload();
		},

		async prepareAssistanceForTable(assistanceIds) {
			const assistances = await this.getAssistances(assistanceIds);
			this.table.data.forEach((item, key) => {
				const assistance = this.prepareEntityForTable(item.assistanceId, assistances);
				this.table.data[key].assistance = assistance.name;
			});
			this.table.progress += 10;
			this.reload();
		},

		async prepareVendorForTable(vendorIds) {
			const vendors = await this.getVendors(vendorIds);
			this.table.data.forEach((item, key) => {
				const vendor = this.prepareEntityForTable(item.vendorId, vendors);
				this.table.data[key].vendor = vendor.name;
				this.table.data[key].vendorNo = vendor.vendorNo;
			});
			this.table.progress += 10;
			this.reload();
		},

		async prepareProductForTable(productIds) {
			const products = await this.getProducts(productIds);
			this.table.data.forEach((item, key) => {
				const product = this.prepareEntityForTable(item.productId, products);
				this.table.data[key].product = product.name;
			});
			this.table.progress += 10;
			this.reload();
		},

		async getProducts(ids) {
			if (!ids.length) return [];
			return ProductService.getProducts(ids)
				.then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Products")} ${e}`, "is-danger");
				});
		},

		async getCommodities(ids) {
			if (!ids.length) return [];
			return AssistancesService.getCommodities(ids)
				.then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Commodities")} ${e}`, "is-danger");
				});
		},

		async getVendors(ids) {
			if (!ids.length) return [];
			return VendorService.getListOfVendors(null, null, null, null, ids)
				.then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Vendors")} ${e}`, "is-danger");
				});
		},

		async getAdm1s(ids) {
			if (!ids.length) return [];
			return LocationsService.getAdm1s(ids)
				.then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t(this.admNames.adm1)} ${e}`, "is-danger");
				});
		},

		async getAdm2s(ids) {
			if (!ids.length) return [];
			return LocationsService.getAdm2s(ids)
				.then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t(this.admNames.adm2)} ${e}`, "is-danger");
				});
		},

		async getAdm3s(ids) {
			if (!ids.length) return [];
			return LocationsService.getAdm3s(ids)
				.then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t(this.admNames.adm3)} ${e}`, "is-danger");
				});
		},

		async getAdm4s(ids) {
			if (!ids.length) return [];
			return LocationsService.getAdm4s(ids)
				.then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t(this.admNames.adm4)} ${e}`, "is-danger");
				});
		},

		async getAssistances(ids) {
			if (!ids.length) return [];
			return AssistancesService.getAssistances(ids)
				.then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Assistances")} ${e}`, "is-danger");
				});
		},

		async getBeneficiaries(ids) {
			return BeneficiariesService.getBeneficiaries(ids)
				.then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Beneficiaries")} ${e}`, "is-danger");
				});
		},

		async getProjects(ids) {
			return ProjectService.getListOfProjects(null, null, null, null, ids)
				.then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Projects")} ${e}`, "is-danger");
				});
		},

		// Methods for Filters
		async fetchProjects() {
			await ProjectService.getListOfProjects()
				.then(({ data }) => {
					this.filtersOptions.project.data = data;
					this.filtersOptions.project.loading = false;
				})
				.catch((e) => {
					Notification(`${this.$t("Projects")} ${e}`, "is-danger");
				});
		},

		async fetchModalityTypes() {
			await AssistancesService.getListOfAllModalityTypes()
				.then(({ data }) => {
					this.filtersOptions.commodity.data = data;
					this.filtersOptions.commodity.loading = false;
				})
				.catch((e) => {
					Notification(`${this.$t("Modality")}${e}`, "is-danger");
				});
		},

		async fetchVendors() {
			await VendorService.getListOfVendors()
				.then(({ data }) => {
					this.filtersOptions.vendor.data = data.map((item) => {
						const vendor = { ...item };
						vendor.vendorName = `${item.name} ${item.shop ? `(${item.shop})` : ""}`;
						return vendor;
					});
					this.filtersOptions.vendor.loading = false;
				})
				.catch((e) => {
					Notification(`${this.$t("Vendor")}${e}`, "is-danger");
				});
		},

		async fetchProvinces() {
			await LocationsService.getListOfAdm1()
				.then(({ data }) => {
					this.filtersOptions.adm1.data = data;
					this.filtersOptions.adm1.loading = false;
				})
				.catch((e) => {
					Notification(`${this.$t("Provinces")} ${e}`, "is-danger");
				});
		},

		async fetchDistricts(id) {
			this.filtersOptions.adm2.loading = true;
			await LocationsService.getListOfAdm2(id)
				.then(({ data }) => {
					this.filtersOptions.adm2.data = data;
					this.filtersOptions.adm2.loading = false;
				})
				.catch((e) => {
					Notification(`${this.$t("Districts")} ${e}`, "is-danger");
				});
		},

		async fetchCommunes(id) {
			this.filtersOptions.adm3.loading = true;
			await LocationsService.getListOfAdm3(id)
				.then(({ data }) => {
					this.filtersOptions.adm3.data = data;
					this.filtersOptions.adm3.loading = false;
				})
				.catch((e) => {
					Notification(`${this.$t("Communes")} ${e}`, "is-danger");
				});
		},

		async fetchVillages(id) {
			this.filtersOptions.adm4.loading = true;
			await LocationsService.getListOfAdm4(id)
				.then(({ data }) => {
					this.filtersOptions.adm4.data = data;
					this.filtersOptions.adm4.loading = false;
				})
				.catch((e) => {
					Notification(`${this.$t("Villages")} ${e}`, "is-danger");
				});
		},

		async fetchBeneficiaryTypes() {
			await BeneficiariesService.getBeneficiaryTypes()
				.then(({ data }) => {
					this.filtersOptions.beneficiaryType.data = data;
					this.filtersOptions.beneficiaryType.loading = false;
				})
				.catch((e) => {
					Notification(`${this.$t("Beneficiary Types")} ${e}`, "is-danger");
				});
		},

		async fetchAssistance() {
			this.filtersOptions.distribution.loading = true;

			this.selectedAssistanceForFilter = [];
			await AssistancesService.getListOfProjectAssistancesByType("distribution", this.selectedFiltersOptions.project?.id)
				.then(({ data }) => {
					this.filtersOptions.distribution.data = data;
					this.filtersOptions.distribution.loading = false;
				}).catch((e) => {
					Notification(`Project Assistances ${e}`, "is-danger");
				});
		},
	},
};
