import AddressService from "@/services/AddressService";
import LocationsService from "@/services/LocationsService";
import baseHelper from "@/mixins/baseHelper";
import { getUniqueIds } from "@/utils/customValidators";
import { Notification } from "@/utils/UI";
import { GENERAL } from "@/consts";

export default {
	mixins: [baseHelper],

	methods: {
		getAddresses(ids) {
			if (!ids?.length) return null;
			return AddressService.getAddresses(ids)
				.then(({ data }) => data)
				.catch((e) => {
					Notification(`${this.$t("Addresses")} ${e.message || e}`, "error");
				});
		},

		getLocations(addresses) {
			if (!addresses?.length) return null;
			return LocationsService.getLocations(addresses)
				.then(({ data }) => data)
				.catch((e) => {
					Notification(`${this.$t("Locations")} ${e.message || e}`, "error");
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

		getAddressTypeAndId(
			{
				temporarySettlementAddressId,
				residenceAddressId,
				campAddressId,
			},
		) {
			if (temporarySettlementAddressId) {
				return {
					typeOfLocation: GENERAL.LOCATION_TYPE.temporarySettlement.type,
					addressId: temporarySettlementAddressId,
				};
			}
			if (residenceAddressId) {
				return {
					typeOfLocation: GENERAL.LOCATION_TYPE.residence.type,
					addressId: residenceAddressId,
				};
			}
			if (campAddressId) {
				return {
					typeOfLocation: GENERAL.LOCATION_TYPE.camp.type,
					addressId: campAddressId,
				};
			}

			return { typeOfLocation: null, addressId: null };
		},

		async getPreparedLocations(addressesIds) {
			const addresses = await this.getAddresses(addressesIds);
			const uniqueLocationIds = getUniqueIds(addresses, "locationId");
			const locations = await this.getLocations(uniqueLocationIds);

			return this.mapLocationOnAddress(locations, addresses);
		},
	},
};
