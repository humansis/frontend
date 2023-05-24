import AddressService from "@/services/AddressService";
import { Notification } from "@/utils/UI";
import LocationsService from "@/services/LocationsService";
import baseHelper from "@/mixins/baseHelper";
import i18n from "@/plugins/i18n";
import CONST from "@/const";
import { getUniqueIds } from "@/utils/customValidators";

export default {
	mixins: [baseHelper],

	methods: {
		async getAddresses(ids) {
			if (!ids?.length) return null;

			try {
				const { data } = await AddressService.getAddresses(ids);

				return data;
			} catch (e) {
				if (e.message) Notification(`${i18n.t("Addresses")} ${e}`, "is-danger");
			}

			return null;
		},

		getLocations(addresses) {
			if (!addresses?.length) return null;
			return LocationsService.getLocations(addresses)
				.then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${i18n.t("Locations")} ${e}`, "is-danger");
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
					typeOfLocation: CONST.LOCATION_TYPE.temporarySettlement.type,
					addressId: temporarySettlementAddressId,
				};
			}
			if (residenceAddressId) {
				return {
					typeOfLocation: CONST.LOCATION_TYPE.residence.type,
					addressId: residenceAddressId,
				};
			}
			if (campAddressId) {
				return {
					typeOfLocation: CONST.LOCATION_TYPE.camp.type,
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
