export default {
	PER_PAGE_OPTIONS: [10, 20, 50, 100],
	DEFAULT_SORT_OPTIONS: {
		ASSISTANCES: { key: "dateDistribution", order: "desc" },
		ASSISTANCE_EDIT: {
			HOUSEHOLD: { key: "id", order: "desc" },
			INSTITUTION: { key: "id", order: "desc" },
		},
		ASSISTANCE_LIST: { key: "dateDistribution", order: "desc" },
		CUSTOM_FIELDS: { key: "id", order: "asc" },
		HOUSEHOLDS: { key: "id", order: "asc" },
		INSTITUTIONS: { key: "id", order: "desc" },
		PROJECTS: { key: "endDate", order: "desc" },
		PRODUCTS_ITEMS: { key: "id", order: "asc" },
		PRODUCTS_CATEGORIES: { key: "id", order: "asc" },
		PURCHASE_LIST: { key: "datePurchase", order: "desc" },
		VENDORS: { key: "id", order: "desc" },
		VOUCHERS: { key: "code", order: "desc" },
	},
};
