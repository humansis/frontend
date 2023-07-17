<template>
	<div>
		<h2 class="title">{{ householdTitle }}</h2>
		<HouseholdTabs
			:detail-of-household="detailOfHousehold"
			:loaded="detailOfHouseholdLoaded"
			is-editing
		/>
	</div>
</template>

<script>
import HouseholdTabs from "@/components/Beneficiaries/Household/HouseholdTabs";
import BeneficiariesService from "@/services/BeneficiariesService";
import { Notification } from "@/utils/UI";

export default {
	name: "EditHousehold",

	data() {
		return {
			detailOfHousehold: {},
			detailOfHouseholdLoaded: false,
		};
	},

	components: {
		HouseholdTabs,
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
				this.detailOfHouseholdLoaded = true;
			}
		},
	},

	computed: {
		householdTitle() {
			const id = this.detailOfHousehold.id ? `(ID: ${this.detailOfHousehold.id})` : "";
			return `${this.$t("Edit Household")} ${id}`;
		},
	},

};
</script>
