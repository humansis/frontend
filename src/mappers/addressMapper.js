import AddressService from "@/services/AddressService";
import { Notification } from "@/utils/UI";
import LocationsService from "@/services/LocationsService";

async function getAddresses(ids) {
	return AddressService.getAddresses(ids)
		.then(({ data }) => data)
		.catch((e) => {
			Notification(`Addresses ${e}`, "is-danger");
		});
}

async function getLocations(addresses) {
	return LocationsService.getLocations(addresses, "locationId")
		.then(({ data }) => data)
		.catch((e) => {
			Notification(`Locations ${e}`, "is-danger");
		});
}

function mapLocationOnAddress(locations, addresses) {
	if (!locations.length) return [];
	const addressesMapped = [];
	addresses.forEach((address) => {
		const location = locations.find((item) => item.adm.locationId === address.locationId);
		if (location) {
			const addressMapped = address;
			addressMapped.locationName = location.adm.name;
			addressesMapped.push(addressMapped);
		}
	});
	return addressesMapped;
}

export const getPreparedLocations = async (addressesIds) => {
	const addresses = await getAddresses(addressesIds);
	const locations = await getLocations(addresses);
	return mapLocationOnAddress(locations, addresses);
};

export default {
	getPreparedLocations,
};
