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

				<b-dropdown-item @click="logout" value="logout">
					<b-icon class="mr-1" icon="sign-out-alt" />
					{{ $t('Log out') }}
				</b-dropdown-item>
			</b-dropdown>
		</template>
	</b-navbar>
</template>

<script>
import { mapActions, mapState } from "vuex";
import CountriesService from "@/services/CountriesService";
import { Notification } from "@/utils/UI";
import TranslationService from "@/services/TranslationService";
import IconService from "@/services/IconService";
import LocationsService from "@/services/LocationsService";

export default {
	name: "NavBar",

	data() {
		return {
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
		if (!this.countries) await this.fetchCountries();
		if (!this.icons) await this.fetchIcons();
		if (!this.admNames) await this.fetchAdmNames();
		this.setTooltip();
	},

	computed: {
		...mapState([
			"isNavBarVisible",
			"isAsideExpanded",
			"country",
			"language",
			"languages",
			"countries",
			"icons",
			"admNames",
		]),

		menuToggleIcon() {
			return this.isAsideExpanded ? "arrow-left" : "arrow-right";
		},

		toggleTooltip() {
			return this.isAsideExpanded ? this.$t("Collapse") : this.$t("Expand");
		},
	},

	methods: {
		...mapActions([
			"storeCountry",
			"storeCountries",
			"storeLanguage",
			"storeTranslations",
			"storeIcons",
			"appLoading",
			"logoutUser",
			"storeAdmNames",
		]),

		menuToggle() {
			this.$store.commit("asideStateToggle");
		},

		async handleChangeCountry(country) {
			await this.storeCountry(country);
			this.storeAdmNames(null);
			this.$router.push({ name: "Home" });
			this.$router.go();
		},

		async handleChangeLanguage(language) {
			this.appLoading(true);

			await TranslationService.getTranslations(language.key).then((response) => {
				if (response.status === 200) {
					this.$i18n.locale = language.key.toLowerCase();
					this.$i18n.fallbackLocale = language.key.toLowerCase();
					this.$root.$i18n.setLocaleMessage(language.key, response.data);

					this.storeLanguage(language);
					this.storeTranslations(response.data);

					this.$router.go();
				}
			}).catch((e) => {
				if (e.message) Notification(`${this.$t("Translations")} ${e}`, "is-danger");
			});

			this.appLoading(false);
		},

		setTooltip() {
			this.tooltip.active = !!this.$route.meta.description;
			this.tooltip.label = this.$route.meta.description;
		},

		async fetchCountries() {
			await CountriesService.getListOfCountries()
				.then(({ data }) => {
					this.storeCountries(data);
				})
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Countries")} ${e}`, "is-danger");
				});
		},

		async fetchIcons() {
			await IconService.getIcons()
				.then(({ data }) => {
					this.storeIcons(data);
				}).catch((e) => {
					if (e.message) Notification(`${this.$t("Icons")} ${e}`, "is-danger");
				});
		},

		async fetchAdmNames() {
			await LocationsService.getAdmNames()
				.then(({ data }) => {
					this.storeAdmNames(data);
				}).catch((e) => {
					if (e.message) Notification(`${this.$t("Location Names")} ${e}`, "is-danger");
				});
		},

		logout() {
			this.$router.push({ name: "Logout" });
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
