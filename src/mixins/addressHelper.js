import LocationsService from "@/services/LocationsService";
import baseHelper from "@/mixins/baseHelper";
import { getUniqueIds } from "@/utils/customValidators";
import { Notification } from "@/utils/UI";
import { GENERAL } from "@/consts";

export default {
	mixins: [baseHelper],

	methods: {
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
				campAddress,
				residenceAddress,
				temporarySettlementAddress,
			},
		) {
			if (campAddress) {
				return {
					...campAddress,
					type: GENERAL.LOCATION_TYPE.camp.type,
				};
			}

			if (residenceAddress) {
				return {
					...residenceAddress,
					type: GENERAL.LOCATION_TYPE.residence.type,
				};
			}

			if (temporarySettlementAddress) {
				return {
					...temporarySettlementAddress,
					type: GENERAL.LOCATION_TYPE.temporarySettlement.type,
				};
			}
			return null;
		},

		async getPreparedLocations(addresses) {
			const uniqueLocationIds = getUniqueIds(addresses, "locationId");
			const locations = await this.getLocations(uniqueLocationIds);

			this.mapLocationOnAddress(locations, addresses);
		},
	},
};
