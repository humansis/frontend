<template>
	<v-container fluid>
		<h2 class="text-center mb-4" data-cy="page-title-text">
			{{ $t('Household Information Summary') }}
		</h2>

		<p v-if="householdHead" class="text-center text-h5 mb-8">
			{{ `${householdHead.localGivenName} ${householdHead.localFamilyName}` }}
		</p>

		<h3 class="text-center mb-4">{{ $t('Current Address') }}</h3>

		<p v-if="householdHead" class="text-center mb-4">
			{{ address }}
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
import BeneficiariesService from "@/services/BeneficiariesService";
import HouseholdAssistancesList from "@/components/Beneficiaries/Household/HouseholdAssistancesList";
import HouseholdPurchasesList from "@/components/Beneficiaries/Household/HouseholdPurchasesList";
import addressHelper from "@/mixins/addressHelper";
import grid from "@/mixins/grid";
import { checkResponseStatus } from "@/utils/fetcher";
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
			try {
				const {
					data,
					status,
					message,
				} = await BeneficiariesService.getDetailOfHousehold(this.$route.params.householdId);

				checkResponseStatus(status, message);

				this.household = data;
				await this.prepareData(data);
			} catch (e) {
				Notification(`${this.$t("Household")}: ${e.message || e}`, "error");
			}
		},

		async prepareData(household) {
			try {
				const {
					data,
					status,
					message,
				} = await BeneficiariesService.getBeneficiary(household.householdHeadId);

				checkResponseStatus(status, message);

				this.householdHead = data;
			} catch (e) {
				Notification(`${this.$t("Beneficiaries")}: ${e.message || e}`, "error");
			}

			const address = this.getAddressTypeAndId(household);

			this.prepareAddressForSummary(address);
		},

		prepareAddressForSummary(currentAddress) {
			if (currentAddress.type === GENERAL.LOCATION_TYPE.camp.type) {
				this.address = `${currentAddress.campName}, ${currentAddress.tentNumber}`;
			} else {
				this.address = `${currentAddress.number}, ${currentAddress.street}, ${currentAddress.postcode}`;
			}
		},
	},
};
</script>
