<template>
	<div>
		<SideMenu />
		<section class="main-content is-fullheight">
			<div class="container pt-4">
				<NavBar />
				<router-view />
			</div>
		</section>
	</div>
</template>

<script>
import SideMenu from "@/layout/SideMenu";
import NavBar from "@/layout/NavBar";

export default {
	name: "MainContainer",

	components: {
		SideMenu,
		NavBar,
	},
};
</script>

<style lang="scss" scoped>
	.main-content {
		margin-left: 60px;
	}
</style>
