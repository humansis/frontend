<template>
	<card-component>
		<b-progress :value="100" />
		<h1 class="title has-text-centered has-text-weight-bold mb-6">
			{{ $t('Household Information Summary') }}
		</h1>
		<h2 v-if="householdHead" class="subtitle is-5 has-text-centered has-text-weight-bold mb-6">
			{{ `${householdHead.localGivenName} ${householdHead.localFamilyName}` }}
		</h2>
		<h3 class="subtitle is-5 has-text-centered has-text-weight-bold mb-5">
			{{ $t('Current Address') }}
		</h3>
		<p v-if="householdHead" class="has-text-centered">
			{{ `${address.number || ""}, ${address.street || ""}, ${address.postcode || ""}` }}
		</p>
		<b-tabs v-model="activeTab">
			<b-tab-item :label="$t('Assistances')">
				<HouseholdAssistancesList />
			</b-tab-item>

			<b-tab-item :label="$t('Purchases')">
				<HouseholdPurchasesList />
			</b-tab-item>
		</b-tabs>
	</card-component>
</template>

<script>
import CardComponent from "@/components/CardComponent";
import BeneficiariesService from "@/services/BeneficiariesService";
import { Notification } from "@/utils/UI";
import addressHelper from "@/mixins/addressHelper";
import AddressService from "@/services/AddressService";
import grid from "@/mixins/grid";
import HouseholdAssistancesList from "@/components/Beneficiaries/Household/HouseholdAssistancesList";
import HouseholdPurchasesList from "@/components/Beneficiaries/Household/HouseholdPurchasesList";
import CONST from "@/const";

export default {
	name: "HouseholdInformationSummary",

	components: {
		HouseholdPurchasesList,
		HouseholdAssistancesList,
		CardComponent,
	},

	mixins: [addressHelper, grid],

	data() {
		return {
			household: {},
			householdHead: null,
			address: {},
			activeTab: 0,
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
			try {
				const { data } = await BeneficiariesService.getDetailOfHousehold(
					this.$route.params.householdId,
				);

				this.household = data;
				await this.prepareData(data);
			} catch (e) {
				if (e.message) Notification(`${this.$t("Household")} ${e}`, "is-danger");
			}
		},

		async prepareData(household) {
			try {
				const { data } = await BeneficiariesService.getBeneficiary(household.householdHeadId);

				this.householdHead = data;
			} catch (e) {
				Notification(`${this.$t("Beneficiary Types")} ${e}`, "is-danger");
			}

			const { typeOfLocation, addressId } = this.getAddressTypeAndId(household);

			this.address = await this.getAddresses(addressId, typeOfLocation);
		},

		async getAddresses(id, type) {
			let address = null;
			if (type === CONST.LOCATION_TYPE.camp.type) {
				try {
					const { data } = AddressService.getCampAddresses([id]);

					data.forEach((item) => {
						address = item;
					});
				} catch (e) {
					if (e.message) Notification(`${this.$t("Camp Address")} ${e}`, "is-danger");
				}
			}
			if (type === CONST.LOCATION_TYPE.residence.type) {
				try {
					const { data } = await AddressService.getResidenceAddresses([id]);

					data.forEach((item) => {
						address = item;
					});
				} catch (e) {
					if (e.message) Notification(`${this.$t("Residence Address")} ${e}`, "is-danger");
				}
			}
			if (type === CONST.LOCATION_TYPE.temporarySettlement.type) {
				try {
					const { data } = await AddressService.getTemporarySettlementAddresses([id]);

					data.forEach((item) => {
						address = item;
					});
				} catch (e) {
					if (e.message) {
						Notification(`${this.$t("Temporary Settlement Address")} ${e}`, "is-danger");
					}
				}
			}
			return address;
		},
	},
};
</script>
