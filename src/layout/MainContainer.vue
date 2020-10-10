<template>
	<div>
		<aside class="side-menu">
			<b-menu>
				<b-menu-list>
					<b-menu-item
						tag="router-link"
						:to="{ name: 'Home' }"
					>
						<template slot="label">
							<span class="icon">
								<img src="../assets/images/bms_logo.png" alt="" class="bms-logo">
							</span>
						</template>
					</b-menu-item>
					<b-menu-item
						label="Home"
						icon-pack="fas"
						icon="home"
						tag="router-link"
						:to="{ name: 'Home' }"
						exact-active-class="is-active"
					/>
					<b-menu-item
						label="Projects"
						icon-pack="fas"
						icon="clipboard-list"
						tag="router-link"
						:to="{ name: 'Projects' }"
						active-class="is-active"
					/>
					<b-menu-item
						label="Beneficiaries"
						icon-pack="fas"
						icon="user-friends"
						tag="router-link"
						:to="{ name: 'Beneficiaries' }"
						active-class="is-active"
					/>
					<b-menu-item
						label="| Households"
						icon-pack="fas"
						icon="arrow"
						tag="router-link"
						:to="{ name: 'Households' }"
						active-class="is-active"
					/>
					<b-menu-item
						label="| Institutions"
						icon-pack="fas"
						icon="arrow"
						tag="router-link"
						:to="{ name: 'Institutions' }"
						active-class="is-active"
					/>
					<b-menu-item
						label="| Communities"
						icon-pack="fas"
						icon="arrow"
						tag="router-link"
						:to="{ name: 'Communities' }"
						active-class="is-active"
					/>
					<b-menu-item
						label="Reports"
						icon-pack="fas"
						icon="chart-line"
						tag="router-link"
						:to="{ name: 'Reports' }"
						active-class="is-active"
					/>
					<b-menu-item
						label="Vouchers"
						icon-pack="fas"
						icon="ticket-alt"
						tag="router-link"
						:to="{ name: 'Vouchers' }"
						active-class="is-active"
					/>
					<b-menu-item
						label="Configuration"
						icon-pack="fas"
						icon="cog"
						tag="router-link"
						:to="{ name: 'Configuration' }"
						active-class="is-active"
					/>
					<b-menu-item
						label="Administrative Settings"
						icon-pack="fas"
						icon="wrench"
						tag="router-link"
						:to="{ name: 'Administrative Settings' }"
						active-class="is-active"
					/>
					<b-menu-item
						label="Logs"
						icon-pack="fas"
						icon="eye"
						tag="router-link"
						:to="{ name: 'Logs' }"
						active-class="is-active"
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
		max-width: 290px;
		height: 100%;
		overflow: hidden;
		background: var(--primary-color);
		z-index: 1001;

		&:hover {
			width: 290px;
		}
	}

	.menu-list ::v-deep a {
		display: flex;
		align-items: center;
		padding: 0;
		height: 56px;
		color: #fff;
		border-radius: 0;
		white-space: nowrap;

		&.is-active {
			color: #a6f2f9;
			background-color: #134252;
		}

		&:hover {
			background: #0c1f1f;
		}

		.icon {
			flex: 0 0 64px;
			height: 56px;
		}

		.bms-logo {
			flex-shrink: 0;
			width: 24px;
			height: 24px;
			font-size: 24px;
			box-sizing: content-box;
			border-radius: 50%;
			padding: 4px;
			background: #fbfcfc;
		}
	}
</style>
