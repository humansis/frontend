import ProjectsService from "@/services/ProjectsService";
import AssistancesService from "@/services/AssistancesService";
import BeneficiariesService from "@/services/BeneficiariesService";
import BaseMapper from "@/mappers/baseMapper";
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
		filledData[key].project = await BaseMapper.prepareEntityForTable(item.projectId, projects, "name");
		filledData[key].beneficiary = await BaseMapper.prepareEntityForTable(item.beneficiaryId, beneficiaries, "localGivenName");
		filledData[key].assistance = await BaseMapper.prepareEntityForTable(item.assistanceId, assistances, "name");
	});

	await Promise.all([promise]);
	return filledData;
};

export default {
	prepareDataForTable,
};
