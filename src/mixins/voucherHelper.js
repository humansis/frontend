import AssistancesService from "@/services/AssistancesService";
import BeneficiariesService from "@/services/BeneficiariesService";
import ProjectService from "@/services/ProjectService";
import baseHelper from "@/mixins/baseHelper";
import { Notification } from "@/utils/UI";

export default {
	mixins: [baseHelper],

	methods: {
		async prepareDataForTable(data) {
			const projectIds = [];
			const assistanceIds = [];
			const beneficiaryIds = [];
			data.forEach((item, key) => {
				this.table.data[key] = item;
				this.table.data[key].beneficiary = this.$t("None");
				this.table.data[key].assistance = this.$t("None");
				if (item.projectId) {
					projectIds.push(item.projectId);
				}
				if (item.assistanceId) {
					assistanceIds.push(item.assistanceId);
				}
				if (item.beneficiaryId) {
					beneficiaryIds.push(item.beneficiaryId);
				}
			});

			await Promise.all([
				this.prepareProjectsForTable(projectIds),
				this.prepareAssistancesForTable(assistanceIds),
				this.prepareBeneficiaryForTable(beneficiaryIds),
			]);

			this.table.progress = 100;
		},

		async prepareBeneficiaryForTable(ids) {
			const beneficiaries = await this.getBeneficiaries(ids);
			if (!beneficiaries.length) return;
			this.table.data.forEach((item, key) => {
				this.table.data[key].beneficiary = this.prepareEntityForTable(
					item.beneficiaryId,
					beneficiaries,
					"localGivenName",
					"None",
				);
			});
		},

		async prepareProjectsForTable(ids) {
			const projects = await this.getProjects(ids);
			if (!projects.length) return;
			this.table.data.forEach((item, key) => {
				this.table.data[key].project = this.prepareEntityForTable(item.projectId, projects, "name", "None");
			});
		},

		async prepareAssistancesForTable(ids) {
			const assistances = await this.getAssistances(ids);
			if (!assistances.length) return;
			this.table.data.forEach((item, key) => {
				this.table.data[key].assistance = this.prepareEntityForTable(item.assistanceId, assistances, "name", "None");
			});
		},

		async getBeneficiaries(ids) {
			if (!ids.length) return [];
			return BeneficiariesService.getBeneficiaries(ids)
				.then(({ data }) => data)
				.catch((e) => {
					Notification(`${this.$t("Beneficiaries")} ${e.message || e}`, "error");
					return [];
				});
		},

		async getAssistances(ids) {
			if (!ids.length) return [];
			return AssistancesService.getAssistances(ids)
				.then(({ data }) => data)
				.catch((e) => {
					Notification(`${this.$t("Assistances")} ${e.message || e}`, "error");
					return [];
				});
		},

		async getProjects(ids) {
			if (!ids.length) return [];
			return ProjectService.getListOfProjects(null, null, null, null, ids)
				.then(({ data }) => data)
				.catch((e) => {
					Notification(`${this.$t("Projects")} ${e.message || e}`, "error");
					return [];
				});
		},
	},
};
