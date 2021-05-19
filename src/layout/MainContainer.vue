<template>
	<div class="main-container">
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
	height: 100%;
}
</style>
