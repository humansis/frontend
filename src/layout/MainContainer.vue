<template>
	<v-layout class="rounded rounded-md">
		<SideMenu />

		<NavBar />

		<v-main>
			<router-view />
		</v-main>
	</v-layout>
</template>

<script>
import { mapState } from "vuex";
import NavBar from "@/layout/NavBar";
import SideMenu from "@/layout/SideMenu";

export default {
	name: "MainContainer",

	components: {
		SideMenu,
		NavBar,
	},

	computed: {
		...mapState([
			"isAsideVisible",
			"isNavBarVisible",
			"translations",
			"language",
			"user",
		]),
	},

	created() {
		this.changeTextDirection(this.language.direction);
		this.setLocales();

		if (!this.isAsideVisible && !this.isNavBarVisible) {
			this.$store.commit("fullPage", false);
		}
	},

	methods: {
		setLocales() {
			this.$i18n.locale = this.language.key;
			this.$i18n.fallbackLocale = this.language.key;
			this.$root.$i18n.setLocaleMessage(this.language.key, this.translations);
		},

		changeTextDirection(direction) {
			const htmlElement = document.getElementsByTagName("html").item(0);
			htmlElement.dir = direction || "ltr";
			if (direction === "ltr") {
				htmlElement.classList.remove("is-rtl");
			} else if (direction === "rtl") {
				htmlElement.classList.add("is-rtl");
			}
		},
	},
};
</script>

<style>
html, body, .main-container, .section {
	height: 100%; /* TODO remove? */
}
</style>
