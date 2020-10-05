<template>
	<div>
		<aside class="side-menu">
			<b-menu>
				<b-menu-list>
					<b-menu-item
						label="Home"
						icon-pack="fas"
						icon="home"
						tag="router-link"
						:to="{ name: 'Home' }"
						class="asdasd"
					/>
					<b-menu-item
						label="Projects"
						icon-pack="fas"
						icon="list"
						tag="router-link"
						:to="{ name: 'Projects' }"
					/>
				</b-menu-list>
			</b-menu>
		</aside>

		<section class="main-content is-fullheight">
			<div class="container">
				<router-view />
			</div>
		</section>
	</div>
</template>

<style lang="scss" scoped>
	.main-content {
		margin-left: 64px;
	}

	.side-menu {
		display: block;
		box-sizing: border-box;
		position: fixed;
		top: 0;
		left: 0;
		width: 64px;
		max-width: 250px;
		height: 100%;
		overflow: hidden;
		background: #132f30;
		z-index: 100;

		&:hover {
			width: 290px;
		}
	}

	.menu-list ::v-deep a {
		padding: 0;
		height: 64px;
		color: #fff;
		border-radius: 0;
		white-space: nowrap;

		.icon {
			height: 64px;
			width: 64px;
		}
	}
</style>
