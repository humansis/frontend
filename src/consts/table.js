export default {
	PER_PAGE_OPTIONS: [10, 20, 50, 100],
	DEFAULT_SORT_OPTIONS: {
		ASSISTANCES: { key: "dateDistribution", order: "desc" },
		HOUSEHOLDS: { key: "id", order: "asc" },
		PROJECTS: { key: "endDate", order: "desc" },
		ASSISTANCE_EDIT: {
			HOUSEHOLD: { key: "id", order: "desc" },
			INSTITUTION: { key: "id", order: "desc" },
		},
	},
};
