<template>
	<div>
		<h2 class="title">{{ householdTitle }}</h2>
		<HouseholdTabs
			:detail-of-household="detailOfHousehold"
			:is-loaded="isDetailOfHouseholdLoaded"
			is-editing
		/>
	</div>
</template>

<script>
import BeneficiariesService from "@/services/BeneficiariesService";
import HouseholdTabs from "@/components/Beneficiaries/Household/HouseholdTabs";
import { Notification } from "@/utils/UI";

export default {
	name: "EditHousehold",

	components: {
		HouseholdTabs,
	},

	data() {
		return {
			detailOfHousehold: {},
			isDetailOfHouseholdLoaded: false,
		};
	},

	computed: {
		householdTitle() {
			const id = this.detailOfHousehold.id ? `(ID: ${this.detailOfHousehold.id})` : "";
			return `${this.$t("Edit Household")} ${id}`;
		},
	},

	async mounted() {
		await this.fetchHouseholdDetail(this.$route.params.householdId);
	},

	methods: {
		async fetchHouseholdDetail(id) {
			try {
				this.detailOfHousehold = await BeneficiariesService.getDetailOfHousehold(id);
			} catch (e) {
				if (e.message) Notification(`${this.$t("Household")} ${e}`, "is-danger");
			} finally {
				this.isDetailOfHouseholdLoaded = true;
			}
		},
	},

};
</script>
