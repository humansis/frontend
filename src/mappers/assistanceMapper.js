import LocationsService from "@/services/LocationsService";
import { Notification } from "@/utils/UI";
import AssistancesService from "@/services/AssistancesService";

export const getLocations = async (ids) => LocationsService.getLocations(ids)
	.then(({ data }) => data)
	.catch((e) => {
		Notification(`Locations ${e}`, "is-danger");
	});

export const getCommodities = async (ids) => AssistancesService.getCommodities(ids)
	.then(({ data }) => data)
	.catch((e) => {
		Notification(`Commodities ${e}`, "is-danger");
	});

export const getStatistics = async (ids) => AssistancesService.getStatistics(ids)
	.then(({ data }) => data)
	.catch((e) => {
		Notification(`Commodities ${e}`, "is-danger");
	});

export default {
	getLocations,
	getCommodities,
	getStatistics,
};
