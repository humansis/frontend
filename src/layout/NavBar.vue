<template>
	<b-navbar v-show="isNavBarVisible" id="navbar-main" class="navbar is-fixed-top">
		<template #brand>
			<a @click.prevent="menuToggle" :title="toggleTooltip" class="navbar-item">
				<b-icon :icon="menuToggleIcon" />
			</a>
		</template>

		<template #start>
			<Breadcrumbs />
		</template>

		<template #end>
			<b-navbar-item>
				<b-tooltip
					multilined
					position="is-bottom"
					:label="tooltip.label"
					:active="tooltip.active"
				>
					<b-icon icon="question" size="is-medium" />
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
					{{ $t(country.iso3)  }}
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
					:value="language.key"
					@click="handleChangeLanguage(language)"
				>
					<b-icon class="mr-1" icon="language" />
					{{ $t(language.name) }}
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

				<router-link :to="{ name: 'Profile' }">
					<b-dropdown-item value="profile">
						<b-icon class="mr-1" icon="user" />
						{{ $t('Profile') }}
					</b-dropdown-item>
				</router-link>

				<router-link :to="{ name: 'Logout' }">
					<b-dropdown-item value="logout">
						<b-icon class="mr-1" icon="sign-out-alt" />
						{{ $t('Log out') }}
					</b-dropdown-item>
				</router-link>
			</b-dropdown>
		</template>
	</b-navbar>
</template>

<script>
import { mapActions, mapState } from "vuex";
import CountriesService from "@/services/CountriesService";
import { Notification } from "@/utils/UI";
import TranslationService from "@/services/TranslationService";

export default {
	name: "NavBar",

	data() {
		return {
			countries: [],
			languages: [],
			tooltip: {
				label: "",
				active: false,
			},
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
		...mapActions([
			"storeCountry",
			"storeLanguage",
		]),

		menuToggle() {
			this.$store.commit("asideStateToggle");
		},

		handleChangeCountry(country) {
			this.updateCountry(country);
			this.$router.push({ name: "Home" });
			this.$router.go();
		},

		async handleChangeLanguage(language) {
			this.$store.dispatch("appLoading", true);
			this.$router.push({ name: "Home" });

			await TranslationService.getTranslations(language.key).then((response) => {
				if (response.status === 200) {
					this.$i18n.locale = language.key.toLowerCase();
					this.$i18n.fallbackLocale = language.key.toLowerCase();
					this.$root.$i18n.setLocaleMessage(language.key, response.data);
					this.storeLanguage(language);
					sessionStorage.setItem("translations", JSON.stringify(response.data));
					this.$router.go();
				}
			}).catch((e) => {
				Notification(`${this.$t("Translations")} ${e}`, "is-danger");
				this.$store.dispatch("appLoading", false);
			});

			this.$store.dispatch("appLoading", false);
		},

		setTooltip() {
			this.tooltip.active = !!this.$route.meta.description;
			this.tooltip.label = this.$route.meta.description;
		},

		async fetchCountries() {
			if (!sessionStorage.getItem("countries")) {
				await CountriesService.getListOfCountries()
					.then(({ data }) => {
						this.countries = data;
						sessionStorage.setItem("countries", JSON.stringify(data));
					})
					.catch((e) => {
						Notification(`${this.$t("Countries")} ${e}`, "is-danger");
					});
			} else {
				this.countries = JSON.parse(sessionStorage.getItem("countries"));
			}
		},

		async fetchLanguages() {
			if (!sessionStorage.getItem("languages")) {
				const languages = [
					{ name: "English", key: "en" },
					{ name: "Arabic", key: "ar" },
					{ name: "Russian", key: "ru" },
					{ name: "Amrahic", key: "am" },
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
		...mapState([
			"isNavBarVisible",
			"isAsideExpanded",
			"country",
			"language",
		]),

		menuToggleIcon() {
			return this.isAsideExpanded ? "arrow-left" : "arrow-right";
		},

		toggleTooltip() {
			return this.isAsideExpanded ? this.$t("Collapse") : this.$t("Expand");
		},
	},

};
</script>

<style lang="scss" scoped>
.dropdown-item {
	display: flex;
	align-items: center;
}
</style>
