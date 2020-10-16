<template>
	<aside>
		<b-sidebar
			:fullheight="fullheight"
			:fullwidth="fullwidth"
			:overlay="overlay"
			:right="right"
			:open.sync="open"
			:expand-on-hover="true"
			:reduce="true"
			:can-cancel="false">
			<div class="m-2">
				<span class="icon">
					<img src="../assets/images/bms_logo.png" alt="" class="bms-logo">
				</span>
				<b-menu class="mt-3">
					<b-menu-list label="Menu">
						<b-menu-item
							label="Home"
							icon="home"
							tag="router-link"
							:to="{ name: 'Home' }"
							exact-active-class="is-active"
						/>
						<b-menu-item
							label="Projects"
							icon="clipboard-list"
							tag="router-link"
							:to="{ name: 'Projects' }"
							active-class="is-active"
						/>
						<b-menu-item
							label="Beneficiaries"
							icon="user-friends"
							class="to-dropdown-item"
						>
							<b-menu-item
								label="Households"
								icon="arrow"
								tag="router-link"
								:to="{ name: 'Households' }"
								active-class="is-active"
							/>
							<b-menu-item
								label="Institutions"
								icon="arrow"
								tag="router-link"
								:to="{ name: 'Institutions' }"
								active-class="is-active"
							/>
							<b-menu-item
								label="Communities"
								icon="arrow"
								tag="router-link"
								:to="{ name: 'Communities' }"
								active-class="is-active"
							/>
						</b-menu-item>
						<b-menu-item
							label="Reports"
							icon="chart-line"
							tag="router-link"
							:to="{ name: 'Reports' }"
							active-class="is-active"
						/>
						<b-menu-item
							label="Vouchers"
							icon="ticket-alt"
							tag="router-link"
							:to="{ name: 'Vouchers' }"
							active-class="is-active"
						/>
						<b-menu-item
							label="Configuration"
							icon="cog"
							tag="router-link"
							:to="{ name: 'Configuration' }"
							active-class="is-active"
						/>
						<b-menu-item
							label="Administrative Settings"
							icon="wrench"
							tag="router-link"
							:to="{ name: 'Administrative Settings' }"
							active-class="is-active"
						/>
						<b-menu-item
							label="Logs"
							icon="eye"
							tag="router-link"
							:to="{ name: 'Logs' }"
							active-class="is-active"
						/>
					</b-menu-list>
				</b-menu>
			</div>
		</b-sidebar>

	</aside>
</template>

<script>
export default {
	name: "SideBar",

	data() {
		return {
			open: true,
			overlay: false,
			fullheight: true,
			fullwidth: false,
			right: false,
		};
	},
};
</script>
