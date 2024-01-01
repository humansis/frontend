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
		DISTRIBUTIONS: { key: "dateDistribution", order: "desc" },
		HOUSEHOLDS: { key: "id", order: "asc" },
		IMPORTS: { key: "createdAt", order: "desc" },
		INSTITUTIONS: { key: "id", order: "desc" },
		PRODUCTS_CATEGORIES: { key: "id", order: "asc" },
		PRODUCTS_ITEMS: { key: "id", order: "asc" },
		PROJECTS: { key: "endDate", order: "desc" },
		PURCHASE_LIST: { key: "datePurchase", order: "desc" },
		SMARTCARD_PURCHASED: { key: "datePurchase", order: "desc" },
	},
};
