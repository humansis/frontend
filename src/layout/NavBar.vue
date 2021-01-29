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
					:key="language.name"
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
import { Notification, Toast } from "@/utils/UI";
import TranslationService from "@/services/TranslationService";

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

	mounted() {
		this.setTooltip();
	},

	methods: {
		...mapActions(["updateCountry", "updateLanguage"]),

		handleChangeCountry(country) {
			localStorage.setItem("country", country.iso3);
			this.updateCountry(country);
			this.$router.go();
		},

		async handleChangeLanguage(language) {
			this.$store.commit("fullPageLoading", true);

			await TranslationService.getTranslations(language.name).then((response) => {
				this.updateLanguage(language);
				localStorage.setItem("language", language.name);
				sessionStorage.setItem("translations", JSON.stringify(response.data) || {});
				this.$i18n.locale = language.name;
				this.$i18n.fallbackLocale = language.name;
				this.$root.$i18n.setLocaleMessage(language.name, response.data);
			}).catch((e) => {
				Notification(`Translations ${e}`, "is-danger");
				this.$store.commit("fullPageLoading", false);
			});

			this.$store.commit("fullPageLoading", false);
		},

		setTooltip() {
			// TODO edit tooltip on some hint
			this.tooltip = this.$route.name;
		},

		async fetchCountries() {
			if (!sessionStorage.getItem("countries")) {
				await CountriesService.getListOfCountries()
					.then(({ data }) => {
						this.countries = data;
						sessionStorage.setItem("countries", JSON.stringify(data));
					})
					.catch((e) => {
						Toast(`(Countries) ${e}`, "is-danger");
					});
			} else {
				this.countries = JSON.parse(sessionStorage.getItem("countries"));
			}
		},

		async fetchLanguages() {
			if (!sessionStorage.getItem("languages")) {
				// TODO Get languages from API
				const languages = [
					{ name: "EN", key: "en" },
					{ name: "AR", key: "ar" },
					{ name: "RU", key: "ru" },
				];
				this.languages = languages;
				sessionStorage.setItem("languages", JSON.stringify(languages));
			} else {
				this.languages = JSON.parse(sessionStorage.getItem("languages"));
			}
		},
	},

	async created() {
		await this.fetchLanguages();
		await this.fetchCountries();
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
