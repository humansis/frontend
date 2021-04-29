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
			"user",
			"isAsideVisible",
			"isNavBarVisible",
		]),
	},

	created() {
		this.jwtExpiration();

		if (!this.isAsideVisible && !this.isNavBarVisible) {
			this.$store.commit("fullPage", false);
		}
	},

	methods: {
		...mapActions(["logoutUser"]),

		jwtExpiration() {
			const now = Math.round(new Date().getTime() / 1000);
			const { exp } = this.user;

			if (now > (exp - 100)) {
				this.logoutUser();
				Notification(`${this.$t("Your session has expired")}`, "is-warning");
			}
		},
	},
};
</script>
