import AssistancesService from "@/services/AssistancesService";
import { Notification } from "@/utils/UI";
import ProjectService from "@/services/ProjectService";
import BeneficiariesService from "@/services/BeneficiariesService";
import baseHelper from "@/mixins/baseHelper";

export default {
	mixins: [baseHelper],

	methods: {
		prepareDataForTable(data) {
			this.table.progress += 20;
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
			this.table.progress += 5;
			this.prepareProjectsForTable(projectIds);

			this.prepareAssistancesForTable(assistanceIds);

			this.prepareBeneficiaryForTable(beneficiaryIds);
		},

		async prepareBeneficiaryForTable(ids) {
			const beneficiaries = await this.getBeneficiaries(ids);
			this.table.progress += 20;
			if (!beneficiaries.length) return;
			this.table.data.forEach((item, key) => {
				this.table.data[key].beneficiary = this.prepareEntityForTable(
					item.beneficiaryId,
					beneficiaries,
					"localGivenName",
					"None",
				);
			});
			this.table.progress += 15;
		},

		async prepareProjectsForTable(ids) {
			const projects = await this.getProjects(ids);
			this.table.progress += 20;
			if (!projects.length) return;
			this.table.data.forEach((item, key) => {
				this.table.data[key].project = this.prepareEntityForTable(item.projectId, projects, "name", "None");
			});
			this.table.progress += 15;
		},

		async prepareAssistancesForTable(ids) {
			const assistances = await this.getAssistances(ids);
			this.table.progress += 20;
			if (!assistances.length) return;
			this.table.data.forEach((item, key) => {
				this.table.data[key].assistance = this.prepareEntityForTable(item.assistanceId, assistances, "name", "None");
			});
			this.table.progress += 15;
		},

		async getBeneficiaries(ids) {
			if (!ids.length) return [];
			return BeneficiariesService.getBeneficiaries(ids)
				.then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`Beneficiaries ${e}`, "is-danger");
					return [];
				});
		},

		async getAssistances(ids) {
			if (!ids.length) return [];
			return AssistancesService.getAssistances(ids)
				.then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`Assistances ${e}`, "is-danger");
					return [];
				});
		},

		async getProjects(ids) {
			if (!ids.length) return [];
			return ProjectService.getListOfProjects(null, null, null, null, ids)
				.then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`Projects ${e}`, "is-danger");
					return [];
				});
		},
	},
};
