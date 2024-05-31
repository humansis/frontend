import { ASSISTANCE } from "@/consts";

export default {
	computed: {
		isCustomAmountEnabled() {
			const availableModalityTypes = [
				ASSISTANCE.COMMODITY.CASH,
				ASSISTANCE.COMMODITY.SMARTCARD,
				ASSISTANCE.COMMODITY.FOOD_RATIONS,
				ASSISTANCE.COMMODITY.READY_TO_EAT_RATIONS,
				ASSISTANCE.COMMODITY.BREAD,
				ASSISTANCE.COMMODITY.AGRICULTURAL_KIT,
				ASSISTANCE.COMMODITY.WASH_KIT,
				ASSISTANCE.COMMODITY.SHELTER_TOOL_KIT,
				ASSISTANCE.COMMODITY.HYGIENE_KIT,
				ASSISTANCE.COMMODITY.DIGNITY_KIT,
				ASSISTANCE.COMMODITY.NFI_KIT,
				ASSISTANCE.COMMODITY.WINTERIZATION_KIT,
			];

			return availableModalityTypes.includes(
				this.assistance?.commodities[0]?.modalityType || this.formModel?.modalityType?.code,
			);
		},

		customFieldName() {
			return this.commodities[0]?.division?.customField?.label;
		},

		duplicatedAssistanceId() {
			return this.$route.query.duplicateAssistance;
		},

		isAssistanceDuplicated() {
			return !!this.duplicatedAssistanceId;
		},

	},
};
