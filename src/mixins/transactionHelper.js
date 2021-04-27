import AssistancesService from "@/services/AssistancesService";
import { Notification } from "@/utils/UI";
import LocationsService from "@/services/LocationsService";
import BeneficiariesService from "@/services/BeneficiariesService";
import ProjectService from "@/services/ProjectService";
import baseHelper from "@/mixins/baseHelper";

export default {
	mixins: [baseHelper],

	methods: {
		async prepareProjectForTable(projectIds) {
			const projects = await this.getProjects(projectIds);
			this.table.data.forEach((item, key) => {
				this.table.data[key].project = this.prepareEntityForTable(item.projectId, projects, "name", "None");
			});
			this.reload();
		},

		async prepareAdm1ForTable(adm1Ids) {
			const adm1s = await this.getAdm1s(adm1Ids);
			this.table.data.forEach((item, key) => {
				this.table.data[key].adm1 = this.prepareEntityForTable(item.adm1Id, adm1s, "name", "None");
			});
			this.reload();
		},

		async prepareAdm2ForTable(adm2Ids) {
			const adm2s = await this.getAdm2s(adm2Ids);
			this.table.data.forEach((item, key) => {
				this.table.data[key].adm2 = this.prepareEntityForTable(item.adm2Id, adm2s, "name", "None");
			});
			this.reload();
		},

		async prepareAdm3ForTable(adm3Ids) {
			const adm3s = await this.getAdm3s(adm3Ids);
			this.table.data.forEach((item, key) => {
				this.table.data[key].adm3 = this.prepareEntityForTable(item.adm3Id, adm3s, "name", "None");
			});
			this.reload();
		},

		async prepareAdm4ForTable(adm4Ids) {
			const adm4s = await this.getAdm4s(adm4Ids);
			this.table.data.forEach((item, key) => {
				this.table.data[key].adm4 = this.prepareEntityForTable(item.adm4Id, adm4s, "name", "None");
			});
			this.reload();
		},

		async prepareCommodityForTable(assistanceIds) {
			const commodities = await this.getCommodities(assistanceIds);
			this.table.data.forEach((item, key) => {
				const commodity = this.prepareEntityForTable(item.commodityId, commodities);
				this.table.data[key].commodity = commodity.modalityType;
				this.table.data[key].unit = commodity.unit;
			});
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
			this.reload();
		},

		async prepareAssistanceForTable(assistanceIds) {
			const assistances = await this.getAssistances(assistanceIds);
			this.table.data.forEach((item, key) => {
				const assistance = this.prepareEntityForTable(item.assistanceId, assistances);
				this.table.data[key].assistance = assistance.name;
			});
			this.reload();
		},

		async prepareVendorForTable(vendorIds) {
			const vendors = await this.getAssistances(vendorIds);
			this.table.data.forEach((item, key) => {
				const vendor = this.prepareEntityForTable(item.vendorId, vendors);
				this.table.data[key].vendor = vendor.name;
				this.table.data[key].vendorNo = vendor.vendorNo;
			});
			this.reload();
		},

		async getCommodities(ids) {
			if (!ids.length) return [];
			return AssistancesService.getCommodities(ids)
				.then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Commodities")} ${e}`, "is-danger");
				});
		},

		async getAdm1s(ids) {
			if (!ids.length) return [];
			return LocationsService.getAdm1s(ids)
				.then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Adm1")} ${e}`, "is-danger");
				});
		},

		async getAdm2s(ids) {
			if (!ids.length) return [];
			return LocationsService.getAdm2s(ids)
				.then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Adm2")} ${e}`, "is-danger");
				});
		},

		async getAdm3s(ids) {
			if (!ids.length) return [];
			return LocationsService.getAdm3s(ids)
				.then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Adm3")} ${e}`, "is-danger");
				});
		},

		async getAdm4s(ids) {
			if (!ids.length) return [];
			return LocationsService.getAdm4s(ids)
				.then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Adm4")} ${e}`, "is-danger");
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
	},
};
