import { prepareEntityForTable } from "@/mappers/baseMapper";
import AssistancesService from "@/services/AssistancesService";
import { Notification } from "@/utils/UI";
import ProjectsService from "@/services/ProjectsService";
import BeneficiariesService from "@/services/BeneficiariesService";

export default {
	methods: {
		prepareDataForTable(data) {
			this.table.progress += 20;
			const projectIds = [];
			const assistanceIds = [];
			const beneficiaryIds = [];
			data.forEach((item, key) => {
				this.table.data[key] = item;
				this.table.data[key].beneficiary = "none";
				this.table.data[key].assistance = "none";
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
				this.table.data[key].beneficiary = prepareEntityForTable(item.beneficiaryId, beneficiaries, "localGivenName", "none");
			});
			this.table.progress += 15;
			this.resetSortKey += 1;
		},

		async prepareProjectsForTable(ids) {
			const projects = await this.getProjects(ids);
			this.table.progress += 20;
			if (!projects.length) return;
			this.table.data.forEach((item, key) => {
				this.table.data[key].project = prepareEntityForTable(item.projectId, projects, "name", "none");
			});
			this.table.progress += 15;
			this.resetSortKey += 1;
		},

		async prepareAssistancesForTable(ids) {
			const assistances = await this.getAssistances(ids);
			this.table.progress += 20;
			if (!assistances.length) return;
			this.table.data.forEach((item, key) => {
				this.table.data[key].assistance = prepareEntityForTable(item.assistanceId, assistances, "name", "none");
			});
			this.resetSortKey += 1;
			this.table.progress += 15;
		},

		async getBeneficiaries(ids) {
			if (!ids.length) return [];
			return BeneficiariesService.getBeneficiaries(ids)
				.then(({ data }) => data)
				.catch((e) => {
					Notification(`Beneficiaries ${e}`, "is-danger");
					return [];
				});
		},

		async getAssistances(ids) {
			if (!ids.length) return [];
			return AssistancesService.getAssistances(ids)
				.then(({ data }) => data)
				.catch((e) => {
					Notification(`Assistances ${e}`, "is-danger");
					return [];
				});
		},

		async getProjects(ids) {
			if (!ids.length) return [];
			return ProjectsService.getListOfProjects(null, null, null, null, ids)
				.then(({ data }) => data)
				.catch((e) => {
					Notification(`Projects ${e}`, "is-danger");
					return [];
				});
		},
	},
};
