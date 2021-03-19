import AddressService from "@/services/AddressService";
import { Notification } from "@/utils/UI";
import LocationsService from "@/services/LocationsService";
import baseHelper from "@/mixins/baseHelper";

export default {
	mixins: [baseHelper],

	methods: {
		getAddresses(ids) {
			if (!ids?.length) return null;
			return AddressService.getAddresses(ids)
				.then(({ data }) => data)
				.catch((e) => {
					Notification(`Addresses ${e}`, "is-danger");
				});
		},

		getLocations(addresses) {
			if (!addresses?.length) return null;
			return LocationsService.getLocations(addresses, "locationId")
				.then(({ data }) => data)
				.catch((e) => {
					Notification(`Locations ${e}`, "is-danger");
				});
		},

		mapLocationOnAddress(locations, addresses) {
			if (!locations?.length) return [];
			const addressesMapped = [];
			addresses.forEach((address) => {
				const location = locations.find((item) => item.locationId === address.locationId);
				if (location) {
					const addressMapped = address;
					addressMapped.locationName = location.name;
					addressesMapped.push(addressMapped);
				}
			});
			return addressesMapped;
		},

		async getPreparedLocations(addressesIds) {
			const addresses = await this.getAddresses(addressesIds);
			const locations = await this.getLocations(addresses);
			return this.mapLocationOnAddress(locations, addresses);
		},
	},
};
