import ProjectsService from "@/services/ProjectsService";
import { Notification } from "@/utils/UI";

async function prepareProject(id, projects) {
	if (!projects.length) return "none";
	const project = await projects.find((item) => item.id === id);
	return project ? project.name : "none";
}

async function getProjects(ids) {
	if (!ids.length) return [];
	return ProjectsService.getListOfProjects(null, null, null, null, ids)
		.then(({ data }) => data)
		.catch((e) => {
			Notification(`Projects ${e}`, "is-danger");
			return [];
		});
}

export const prepareDataForTable = async (data) => {
	const filledData = [];
	const projectIds = [];
	let promise = await data.forEach((item, key) => {
		filledData[key] = item;
		projectIds.push(item.projectId);
	});

	await Promise.all([promise]);
	const projects = await getProjects([...new Set(projectIds)]);

	promise = await data.map(async (item, key) => {
		filledData[key].project = await prepareProject(item.projectId, projects);
	});

	await Promise.all([promise]);
	return filledData;
};

export default {
	prepareDataForTable,
};
