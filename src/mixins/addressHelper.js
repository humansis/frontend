import LocationsService from "@/services/LocationsService";
import baseHelper from "@/mixins/baseHelper";
import { getUniqueIds } from "@/utils/customValidators";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";
import { GENERAL } from "@/consts";

export default {
	mixins: [baseHelper],

	methods: {
		async getLocations(addresses) {
			if (!addresses?.length) return [];

			try {
				const {
					data: { data },
					status,
					message,
				} = await LocationsService.getLocations({ ids: addresses });

				checkResponseStatus(status, message);

				return data;
			} catch (e) {
				Notification(`${this.$t("Locations")}: ${e.message || e}`, "error");
				return [];
			}
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
			if (campAddress?.address?.camp) {
				return {
					...campAddress.address.camp,
					camp: campAddress.address.camp_id,
					campName: campAddress.address.camp?.name,
					tentNumber: campAddress.address.tent_number,
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
