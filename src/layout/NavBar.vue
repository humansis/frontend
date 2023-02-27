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
					<a href="https://www.humansis.org/knowledge-base/" target="_blank">
						<b-icon icon="question" size="is-medium" />
					</a>
				</b-tooltip>
			</b-navbar-item>

			<b-dropdown
				v-model="country.iso3"
				position="is-bottom-left"
				aria-role="menu"
			>
				<a
					class="navbar-item"
					slot="trigger"
					role="button"
				>
					<b-icon icon="globe-africa" size="is-medium" />
					<span class="country-name has-text-centered">{{ country.iso3 }}</span>
				</a>

				<b-dropdown-item
					v-for="value in countries"
					:key="value.name"
					:value="value.iso3"
					@click="handleChangeCountry(value)"
				>
					<b-icon class="mr-1" icon="globe" />
					{{ $t(value.iso3)  }}
				</b-dropdown-item>
			</b-dropdown>

			<b-dropdown
				v-model="language.name"
				position="is-bottom-left"
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
					v-for="value in languages"
					:key="value.key"
					:value="value.key"
					:class="language.key === value.key ? 'is-active' : ''"
					@click="handleChangeLanguage(value)"
				>
					<b-icon class="mr-1" icon="language" />
					{{ $t(value.name) }}
				</b-dropdown-item>
			</b-dropdown>

			<b-dropdown
				position="is-bottom-left"
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

	async created() {
		if (!this.icons) await this.fetchIcons();
		if (!this.admNames?.adm1) await this.fetchAdmNames();
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
			"storeAdmNames",
		]),

		menuToggle() {
			this.$store.commit("asideStateToggle");
		},

		async handleChangeCountry(country) {
			await this.storeCountry(country);
			await this.fetchAdmNames();

			if (this.$route.name !== "Projects") {
				await this.$router.push({ name: "Projects" });
			}

			this.$router.go();
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
				if (e.message) Notification(`${this.$t("Translations")} ${e}`, "is-danger");
			});

			this.$router.go();
		},

		setTooltip() {
			this.tooltip.active = !!this.$route.meta.description;
			this.tooltip.label = this.$route.meta.description;
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

.country-name {
	line-height: 10px;
	font-size: 12px;
	position: absolute;
	background-color: white;
	width: 50%;
	padding-left: 5%;
}

.is-rtl .country-name {
	padding-left: 0;
	padding-right: 5%;
}
</style>
