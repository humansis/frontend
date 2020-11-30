<template>
	<div>
		<b-loading v-model="isLoading" />
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
import SideMenu from "@/layout/SideMenu";
import NavBar from "@/layout/NavBar";
import { mapState } from "vuex";

export default {
	name: "MainContainer",

	components: {
		SideMenu,
		NavBar,
	},

	computed: {
		...mapState(["isLoading"]),
	},
};
</script>

<style scoped>
.main-content {
	margin-left: 60px;
}
</style>
