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
import { mapState } from "vuex";
import SideMenu from "@/layout/SideMenu";
import NavBar from "@/layout/NavBar";
import getters from "@/store/getters";
import TranslationService from "@/services/TranslationService";
import { Notification } from "@/utils/UI";

export default {
	name: "MainContainer",

	components: {
		SideMenu,
		NavBar,
	},

	computed: {
		...mapState(["isAppLoading", "language"]),
	},

	created() {
		this.setLocales();
	},

	methods: {
		async setLocales() {
			const { key: languageKey } = getters.getLanguageFromVuexStorage()
			|| this.language;

			if (!sessionStorage.getItem("translations")) {
				this.$store.dispatch("appLoading", true);

				await TranslationService.getTranslations(languageKey).then((response) => {
					if (response.status === 200) {
						sessionStorage.setItem("translations", JSON.stringify(response.data));
						this.$root.$i18n.setLocaleMessage(languageKey, response.data);
					}
				}).catch((e) => {
					Notification(`${this.$t("Translations")} ${e}`, "is-danger");
					this.$store.dispatch("appLoading", false);
				});

				this.$store.dispatch("appLoading", false);
			} else {
				this.$root.$i18n.setLocaleMessage(languageKey, JSON.parse(
					sessionStorage.getItem("translations"),
				));
			}
		},
	},
};
</script>
