<template>
	<v-container fluid>
		<div class="d-flex mb-4">
			<h2 class="me-auto" data-cy="page-title-text">
				{{ $t('Edit Household') }}  (ID: {{ householdId }})
			</h2>
		</div>

		<HouseholdTabs
			v-if="isDetailOfHouseholdLoaded"
			:detail-of-household="detailOfHousehold"
			is-editing
		/>

		<v-card v-else class="text-center pa-16">
			<v-progress-circular
				:size="128"
				model-value="20"
				indeterminate
			/>
		</v-card>
	</v-container>
</template>

<script>
import BeneficiariesService from "@/services/BeneficiariesService";
import HouseholdTabs from "@/components/Beneficiaries/Household/HouseholdTabs";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";

export default {
	name: "EditHousehold",

	components: {
		HouseholdTabs,
	},

	data() {
		return {
			householdId: this.$route.params.householdId,
			detailOfHousehold: null,
			isDetailOfHouseholdLoaded: false,
		};
	},

	async mounted() {
		await this.fetchHouseholdDetail(this.householdId);
	},

	methods: {
		async fetchHouseholdDetail(id) {
			try {
				const {
					data,
					status,
					message,
				} = await BeneficiariesService.getDetailOfHousehold(id);

				checkResponseStatus(status, message);

				this.detailOfHousehold = data;
			} catch (e) {
				Notification(`${this.$t("Household")}: ${e.message || e}`, "error");
			} finally {
				this.isDetailOfHouseholdLoaded = true;
			}
		},
	},
};
</script>
