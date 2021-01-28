<template>
	<b-navbar>
		<template slot="start">
			<b-navbar-item>
				<Breadcrumbs />
			</b-navbar-item>
		</template>
		<template slot="end">
			<b-navbar-item>
				<b-tooltip :label="tooltip" position="is-bottom" active>
					<b-icon
						icon="question"
						size="is-medium"
					/>
				</b-tooltip>
			</b-navbar-item>
			<b-dropdown
				v-model="country.iso3"
				position="is-bottom-left"
				append-to-body
				aria-role="menu"
			>
				<a
					class="navbar-item"
					slot="trigger"
					role="button"
				>
					<b-icon icon="globe-africa" size="is-medium" />
				</a>
				<b-dropdown-item
					v-for="country in countries"
					:key="country.name"
					:value="country.iso3"
					@click="handleChangeCountry(country)"
				>
					<b-icon class="mr-1" icon="globe" />
					{{ country.iso3 }}
				</b-dropdown-item>
			</b-dropdown>

			<b-dropdown
				v-model="language.name"
				position="is-bottom-left"
				append-to-body
				aria-role="menu"
			>
				<a
					class="navbar-item"
					slot="trigger"
					role="button"
				>
					<b-icon icon="language" size="is-medium" />
				</a>
				<b-dropdown-item
					v-for="language in languages"
					:key="language.key"
					:value="language.name"
					@click="handleChangeLanguage(language)"
				>
					<b-icon class="mr-1" icon="language" />
					{{ language.name }}
				</b-dropdown-item>
			</b-dropdown>

			<b-dropdown
				position="is-bottom-left"
				append-to-body
				aria-role="menu"
			>
				<a
					class="navbar-item"
					slot="trigger"
					role="button"
				>
					<b-icon icon="user" size="is-medium" />
				</a>
				<router-link to="/profile">
					<b-dropdown-item value="profile">
						<b-icon class="mr-1" icon="user" />
						Profile
					</b-dropdown-item>
				</router-link>
				<b-dropdown-item value="logout">
					<b-icon class="mr-1" icon="sign-out-alt" />
					Log out
				</b-dropdown-item>
			</b-dropdown>
		</template>
	</b-navbar>
</template>

<script>
import { mapActions, mapState } from "vuex";
import CountriesService from "@/services/CountriesService";
import { Toast } from "@/utils/UI";

export default {
	name: "NavBar",

	data() {
		return {
			countries: [],
			languages: [],
			tooltip: "",
		};
	},

	watch: {
		$route: "setTooltip",
	},

	async mounted() {
		await this.fetchCountries();
		await this.fetchLanguages();
		this.setTooltip();
	},

	methods: {
		...mapActions(["updateCountry", "updateLanguage"]),

		handleChangeCountry(country) {
			this.updateCountry(country);
			this.$router.go();
		},

		handleChangeLanguage(language) {
			this.updateLanguage(language);
			this.$router.go();
		},

		setTooltip() {
			// TODO edit tooltip on some hint
			this.tooltip = this.$route.name;
		},

		async fetchCountries() {
			await CountriesService.getListOfCountries()
				.then(({ data }) => {
					this.countries = data;
				})
				.catch((e) => {
					Toast(`(Countries) ${e}`, "is-danger");
				});
		},

		async fetchLanguages() {
			// TODO Get languages
			this.languages = [
				{ name: "EN", key: "en" },
				{ name: "CZ", key: "cz" },
			];
		},
	},

	computed: {
		...mapState(["country", "language"]),
	},

};
</script>

<style lang="scss" scoped>
.dropdown-item {
	display: flex;
	align-items: center;
}
</style>
