import { mapState } from "vuex";

export default {
	computed: {
		...mapState(["country"]),

		countryUrlParam() {
			return this.country?.iso3?.toLowerCase() || "";
		},
	},

	methods: {
		async routerPush({ name, query, params }) {
			// eslint-disable-next-line
			if (typeof arguments[0] === "string") {
				// eslint-disable-next-line
				const url = arguments[0];
				if (url.substring(0, 3).includes(this.countryUrlParam)) {
					await this.$router.push(url);
				} else {
					await this.$router.push(`/${this.countryUrlParam}/${url}`);
				}

				this.$router.go();
			} else {
				this.$router.push({
					name,
					query,
					params: {
						...params,
						country: this.countryUrlParam,
					},
				});
			}
		},
	},
};
