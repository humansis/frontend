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

export default {
	name: "MainContainer",

	components: {
		SideMenu,
		NavBar,
	},

	computed: {
		...mapState([
			"isAppLoading",
			"isAsideVisible",
			"isNavBarVisible",
			"translations",
			"language",
		]),
	},

	created() {
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
	},
};
</script>
