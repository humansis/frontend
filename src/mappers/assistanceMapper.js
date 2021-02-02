import { normalizeText } from "@/utils/datagrid";
import LocationsService from "@/services/LocationsService";
import { Notification } from "@/utils/UI";
import AssistancesService from "@/services/AssistancesService";
import { prepareEntityForTable } from "@/mappers/baseMapper";

async function getLocations(ids) {
	return LocationsService.getLocations(ids)
		.then(({ data }) => data)
		.catch((e) => {
			Notification(`Locations ${e}`, "is-danger");
		});
}

async function getCommodities(ids) {
	return AssistancesService.getCommodities(ids)
		.then(({ data }) => data)
		.catch((e) => {
			Notification(`Commodities ${e}`, "is-danger");
		});
}

async function getStatistics(ids) {
	return AssistancesService.getStatistics(ids)
		.then(({ data }) => data)
		.catch((e) => {
			Notification(`Commodities ${e}`, "is-danger");
		});
}

export const prepareDataForTable = async (data) => {
	const filledData = [];
	const locationIds = [];
	const assistanceIds = [];
	let promise = data.map(async (item, key) => {
		filledData[key] = item;
		filledData[key].target = normalizeText(item.target);
		locationIds.push(item.locationId);
		assistanceIds.push(item.id);
	});
	const locations = await getLocations(locationIds);
	const commodities = await getCommodities(assistanceIds);
	const statistics = await getStatistics(assistanceIds);

	await Promise.all(promise);
	promise = data.map(async (item, key) => {
		filledData[key] = item;
		filledData[key].location = (await prepareEntityForTable(item.locationId, locations, "adm")).name;
		filledData[key].commodity = await prepareEntityForTable(item.id, commodities, "modalityType");
		filledData[key].beneficiaries = await prepareEntityForTable(item.id, statistics, "numberOfBeneficiaries", 0);
		filledData[key].target = normalizeText(item.target);
	});

	await Promise.all(promise);
	return filledData;
};

export default {
	prepareDataForTable,
};
