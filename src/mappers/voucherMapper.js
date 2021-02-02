import ProjectsService from "@/services/ProjectsService";
import AssistancesService from "@/services/AssistancesService";
import BeneficiariesService from "@/services/BeneficiariesService";
import { prepareEntityForTable } from "@/mappers/baseMapper";
import { Notification } from "@/utils/UI";

async function getProjects(ids) {
	if (!ids.length) return [];
	return ProjectsService.getListOfProjects(null, null, null, null, ids)
		.then(({ data }) => data)
		.catch((e) => {
			Notification(`Projects ${e}`, "is-danger");
			return [];
		});
}

async function getAssistances(ids) {
	if (!ids.length) return [];
	return AssistancesService.getAssistances(ids)
		.then(({ data }) => data)
		.catch((e) => {
			Notification(`Assistances ${e}`, "is-danger");
			return [];
		});
}

async function getBeneficiaries(ids) {
	if (!ids.length) return [];
	return BeneficiariesService.getBeneficiaries(ids)
		.then(({ data }) => data)
		.catch((e) => {
			Notification(`Beneficiaries ${e}`, "is-danger");
			return [];
		});
}

export const prepareDataForTable = async (data) => {
	const filledData = [];
	const projectIds = [];
	const assistanceIds = [];
	const beneficiaryIds = [];
	let promise = await data.forEach((item, key) => {
		filledData[key] = item;
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

	await Promise.all([promise]);
	const projects = await getProjects([...new Set(projectIds)]);
	const assistances = await getAssistances([...new Set(assistanceIds)]);
	const beneficiaries = await getBeneficiaries([...new Set(beneficiaryIds)]);

	promise = await data.map(async (item, key) => {
		filledData[key].project = await prepareEntityForTable(item.projectId, projects, "name", "none");
		filledData[key].beneficiary = await prepareEntityForTable(item.beneficiaryId, beneficiaries, "localGivenName", "none");
		filledData[key].assistance = await prepareEntityForTable(item.assistanceId, assistances, "name", "none");
	});

	await Promise.all([promise]);
	return filledData;
};

export default {
	prepareDataForTable,
};
