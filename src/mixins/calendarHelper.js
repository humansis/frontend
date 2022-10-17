import i18n from "@/plugins/i18n";

export default {
	methods: {
		months() {
			return [
				i18n.t("January"),
				i18n.t("February"),
				i18n.t("March"),
				i18n.t("April"),
				i18n.t("May"),
				i18n.t("June"),
				i18n.t("July"),
				i18n.t("August"),
				i18n.t("September"),
				i18n.t("October"),
				i18n.t("November"),
				i18n.t("December"),
			];
		},
	},
};
