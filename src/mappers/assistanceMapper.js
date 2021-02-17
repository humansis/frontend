import LocationsService from "@/services/LocationsService";
import { Notification } from "@/utils/UI";
import AssistancesService from "@/services/AssistancesService";

export const getLocations = async (ids) => {
	if (!ids.length) return [];
	return LocationsService.getLocations(ids)
		.then(({ data }) => data)
		.catch((e) => {
			Notification(`Locations ${e}`, "is-danger");
		});
};

export const getCommodities = async (ids) => {
	if (!ids.length) return [];
	return AssistancesService.getCommodities(ids)
		.then(({ data }) => data)
		.catch((e) => {
			Notification(`Commodities ${e}`, "is-danger");
		});
};

export const getStatistics = async (ids) => {
	if (!ids.length) return [];
	return AssistancesService.getStatistics(ids)
		.then(({ data }) => data)
		.catch((e) => {
			Notification(`Commodities ${e}`, "is-danger");
		});
};

export default {
	getLocations,
	getCommodities,
	getStatistics,
};
