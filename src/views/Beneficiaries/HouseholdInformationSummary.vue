<template>
	<v-container fluid>
		<h2 class="text-center mb-4">{{ $t('Household Information Summary') }}</h2>

		<p v-if="householdHead" class="text-center text-h5 mb-8">
			{{ `${householdHead.localGivenName} ${householdHead.localFamilyName}` }}
		</p>

		<h3 class="text-center mb-4">{{ $t('Current Address') }}</h3>

		<p v-if="householdHead" class="text-center mb-4">
			{{ `${address.number || ""}, ${address.street || ""}, ${address.postcode || ""}` }}
		</p>

		<v-tabs v-model="activeTab">
			<v-tab value="assistances">{{ $t('Assistances') }}</v-tab>

			<v-tab value="purchases">{{ $t('Purchases') }}</v-tab>
		</v-tabs>

		<v-window v-model="activeTab">
			<v-window-item value="assistances">
				<HouseholdAssistancesList />
			</v-window-item>

			<v-window-item value="purchases">
				<HouseholdPurchasesList />
			</v-window-item>
		</v-window>
	</v-container>
</template>

<script>
import AddressService from "@/services/AddressService";
import BeneficiariesService from "@/services/BeneficiariesService";
import HouseholdAssistancesList from "@/components/Beneficiaries/Household/HouseholdAssistancesList";
import HouseholdPurchasesList from "@/components/Beneficiaries/Household/HouseholdPurchasesList";
import addressHelper from "@/mixins/addressHelper";
import grid from "@/mixins/grid";
import { Notification } from "@/utils/UI";
import { GENERAL } from "@/consts";

export default {
	name: "HouseholdInformationSummary",

	components: {
		HouseholdAssistancesList,
		HouseholdPurchasesList,
	},

	mixins: [addressHelper, grid],

	data() {
		return {
			household: {},
			householdHead: null,
			address: {},
			activeTab: "assistances",
		};
	},

	created() {
		this.fetchData();
	},

	methods: {
		async fetchData() {
			await this.fetchHousehold();
		},

		async fetchHousehold() {
			await BeneficiariesService.getDetailOfHousehold(this.$route.params.householdId)
				.then((data) => {
					this.household = data;
					this.prepareData(data);
				}).catch((e) => {
					Notification(`${this.$t("Household")} ${e.message || e}`, "error");
				});
		},

		async prepareData(household) {
			BeneficiariesService.getBeneficiary(household.householdHeadId)
				.then((data) => {
					this.householdHead = data;
				});
			const { typeOfLocation, addressId } = this.getAddressTypeAndId(household);

			this.address = await this.getAddresses(addressId, typeOfLocation);
		},

		async getAddresses(id, type) {
			let address = null;
			if (type === GENERAL.LOCATION_TYPE.camp.type) {
				await AddressService.getCampAddresses([id])
					.then(({ data }) => {
						data.forEach((item) => {
							address = item;
						});
					}).catch((e) => {
						Notification(`${this.$t("Camp Address")} ${e.message || e}`, "error");
					});
			}
			if (type === GENERAL.LOCATION_TYPE.residence.type) {
				await AddressService.getResidenceAddresses([id])
					.then(({ data }) => {
						data.forEach((item) => {
							address = item;
						});
					}).catch((e) => {
						Notification(`${this.$t("Residence Address")} ${e.message || e}`, "error");
					});
			}
			if (type === GENERAL.LOCATION_TYPE.temporarySettlement.type) {
				await AddressService.getTemporarySettlementAddresses([id])
					.then(({ data }) => {
						data.forEach((item) => {
							address = item;
						});
					}).catch((e) => {
						Notification(`${this.$t("Temporary Settlement Address")} ${e.message || e}`, "error");
					});
			}
			return address;
		},
	},
};
</script>
