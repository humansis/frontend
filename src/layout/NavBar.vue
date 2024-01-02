<template>
	<v-app-bar
		v-show="isNavBarVisible"
		density="compact"
		elevation="0"
	>
		<v-app-bar-nav-icon
			class="navbar-item"
			:title="toggleTooltip"
			@click.prevent="menuToggle"
		>
			<v-icon :icon="menuToggleIcon" class="expand-icon" />
		</v-app-bar-nav-icon>

		<v-breadcrumbs :items="breadcrumbs">
			<template v-slot:title="{ item }">
				{{ $t(item.title) }}
			</template>
		</v-breadcrumbs>

		<template v-slot:append>
			<v-tooltip
				:text="tooltip.label"
				location="bottom"
				:disabled="!tooltip.active"
				max-width="240"
			>
				<template v-slot:activator="{ props }">
					<v-btn
						v-bind="props"
						href="https://www.humansis.org/knowledge-base/"
						icon="question"
						size="x-small"
						target="_blank"
						rel="noopener noreferrer"
						class="mr-2"
					/>
				</template>
			</v-tooltip>

			<v-menu>
				<template v-slot:activator="{ props }">
					<v-btn v-bind="props" icon="globe-africa" size="small" class="mr-2">
						<v-icon class="mr-1" icon="globe-africa" size="large" />

						<span class="country-name has-text-centered">{{ $t(country.iso3) }}</span>
					</v-btn>
				</template>

				<v-list>
					<v-list-item
						v-for="value in countries"
						:key="value.name"
						:value="value.iso3"
						@click="handleChangeCountry(value)"
					>
						{{ $t(value.iso3) }}
					</v-list-item>
				</v-list>
			</v-menu>

			<v-menu>
				<template v-slot:activator="{ props }">
					<v-btn v-bind="props" icon="language" size="small" class="mr-2" />
				</template>

				<v-list>
					<v-list-item
						v-for="value in languages"
						:key="value.key"
						:value="value.key"
						:class="language.key === value.key ? 'is-active' : ''"
						@click="handleChangeLanguage(value)"
					>
						{{ $t(value.name) }}
					</v-list-item>
				</v-list>
			</v-menu>

			<v-menu>
				<template v-slot:activator="{ props }">
					<v-btn v-bind="props" icon="user" size="small" />
				</template>

				<v-list>
					<router-link :to="{ name: 'Profile' }">
						<v-list-item value="profile">
							<v-icon class="mr-1" icon="fa-user" size="x-small" />
							{{ $t('Profile') }}
						</v-list-item>
					</router-link>

					<v-list-item @click="logout" value="logout">
						<v-icon class="mr-1" icon="sign-out-alt" size="x-small" />
						{{ $t('Log out') }}
					</v-list-item>
				</v-list>
			</v-menu>
		</template>
	</v-app-bar>
</template>

<script>
import { mapActions, mapState } from "vuex";
import IconService from "@/services/IconService";
import LocationsService from "@/services/LocationsService";
import TranslationService from "@/services/TranslationService";
import { Notification } from "@/utils/UI";

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

		breadcrumbs() {
			return this.$route.matched.map((item) => {
				if (!item.meta?.breadcrumb && !item.name) {
					return null;
				}

				return {
					title: item.meta?.breadcrumb || item.name,
					href: item.path.replace(":countryCode", this.country.iso3),
				};
			}).filter((r) => r);
		},

		menuToggleIcon() {
			return this.isAsideExpanded ? "xmark" : "bars";
		},

		toggleTooltip() {
			return this.isAsideExpanded ? this.$t("Collapse") : this.$t("Expand");
		},
	},

	watch: {
		$route: "setTooltip",
	},

	async created() {
		if (!this.icons) await this.fetchIcons();
		if (!this.admNames?.adm1) await this.fetchAdmNames();
		this.setTooltip();
	},

	methods: {
		...mapActions([
			"storeCountry",
			"storeCountries",
			"storeLanguage",
			"storeTranslations",
			"storeIcons",
			"storeAdmNames",
		]),

		menuToggle() {
			this.$store.commit("asideStateToggle");
		},

		async handleChangeCountry(country) {
			await this.storeCountry(country);
			await this.fetchAdmNames();

			this.$router.push({ name: "Projects", params: { countryCode: country.iso3 } });
		},

		async handleChangeLanguage(language) {
			await TranslationService.getTranslations(language.key).then(async (response) => {
				if (response.status === 200) {
					this.$i18n.locale = language.key.toLowerCase();
					this.$i18n.fallbackLocale = language.key.toLowerCase();
					this.$root.$i18n.setLocaleMessage(language.key, response.data);
					await this.storeLanguage(language);
					await this.storeTranslations(response.data);
					await this.fetchAdmNames();
				}
			}).catch((e) => {
				Notification(`${this.$t("Translations")} ${e.message || e}`, "error");
			});

			this.$router.go();
		},

		setTooltip() {
			this.tooltip.active = !!this.$route.meta?.description;
			this.tooltip.label = this.$t(this.$route.meta?.description || "");
		},

		async fetchIcons() {
			await IconService.getIcons()
				.then(({ data }) => {
					this.storeIcons(data);
				}).catch((e) => {
					Notification(`${this.$t("Icons")} ${e.message || e}`, "error");
				});
		},

		async fetchAdmNames() {
			await LocationsService.getAdmNames()
				.then(({ data }) => {
					this.storeAdmNames(data);
				}).catch((e) => {
					Notification(`${this.$t("Location Names")} ${e.message || e}`, "error");
				});
		},

		logout() {
			this.$router.push({ name: "Logout" });
		},
	},

};
</script>
<style lang="scss">
.navbar-item .expand-icon > svg {
	height: 1rem;
}

.country-name {
	line-height: .625rem;
	font-size: .8rem;
	position: absolute;
	background-color: white;
	margin-left: -.187rem;
}
</style>
