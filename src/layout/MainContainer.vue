<template>
	<div>
		<b-loading
			is-full-page
			:active="this.isAppLoading"
			:can-cancel="false"
		/>
		<NavBar />
		<SideMenu />
		<section class="section">
			<router-view />
		</section>
	</div>
</template>

<script>
import { mapActions, mapState } from "vuex";
import SideMenu from "@/layout/SideMenu";
import NavBar from "@/layout/NavBar";
import TranslationService from "@/services/TranslationService";
import { Notification } from "@/utils/UI";

export default {
	name: "MainContainer",

	components: {
		SideMenu,
		NavBar,
	},

	computed: {
		...mapState([
			"isAppLoading",
			"language",
			"translations",
			"user",
		]),
	},

	created() {
		// this.jwtExpiration();
		this.setLocales();
	},

	methods: {
		...mapActions(["storeTranslations", "appLoading", "logoutUser"]),

		/*
		jwtExpiration() {
			const now = Math.round(new Date().getTime() / 1000);
			const { exp } = this.user;

			if (now > exp) {
				this.logoutUser();
				Notification(`${this.$t("Your session has expired")}.
				${this.$t("Please login again")}`, "is-danger");
			}
		},
		 */

		async setLocales() {
			const { key: languageKey } = this.language;

			if (!this.translations) {
				this.appLoading(true);

				await TranslationService.getTranslations(languageKey).then((response) => {
					if (response.status === 200) {
						this.storeTranslations(response.data);
						this.$root.$i18n.setLocaleMessage(languageKey, response.data);
					}
				}).catch((e) => {
					Notification(`${this.$t("Translations")} ${e}`, "is-danger");
				});

				this.appLoading(false);
			} else {
				this.$root.$i18n.setLocaleMessage(languageKey, this.translations);
			}
		},
	},
};
</script>
