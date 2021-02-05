<template>
	<div>
		<b-loading
			is-full-page
			:active="this.isAppLoading"
			:can-cancel="false"
		/>
		<SideMenu />
		<section class="main-content is-fullheight">
			<div class="container">
				<NavBar />
				<router-view />
			</div>
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
		...mapState(["isAppLoading"]),
	},
};
</script>

<style scoped>
.main-content {
	margin-left: 60px;
}
</style>
