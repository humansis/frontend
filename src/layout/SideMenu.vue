<template>
	<aside>
		<b-sidebar
			:fullheight="true"
			:fullwidth="false"
			:overlay="false"
			:right="false"
			:open.sync="true"
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
							exact-active-class="is-active"
							tag="router-link"
							:to="{ name: 'Home' }"
						/>
						<b-menu-item
							label="Projects"
							icon="clipboard-list"
							exact-active-class="is-active"
							tag="router-link"
							:to="{ name: 'Projects' }"
						/>
						<b-menu-item
							label="Beneficiaries"
							icon="user-friends"
							class="to-dropdown-item"
						>
							<b-menu-item
								label="Households"
								icon="arrow"
								exact-active-class="is-active"
								tag="router-link"
								:to="{ name: 'Households' }"
							/>
							<b-menu-item
								label="Institutions"
								icon="arrow"
								exact-active-class="is-active"
								tag="router-link"
								:to="{ name: 'Institutions' }"
							/>
							<b-menu-item
								label="Communities"
								icon="arrow"
								exact-active-class="is-active"
								tag="router-link"
								:to="{ name: 'Communities' }"
							/>
						</b-menu-item>
						<b-menu-item
							label="Reports"
							icon="chart-line"
							exact-active-class="is-active"
							tag="router-link"
							:to="{ name: 'Reports' }"
						/>
						<b-menu-item
							label="Vouchers"
							icon="ticket-alt"
							exact-active-class="is-active"
							tag="router-link"
							:to="{ name: 'Vouchers' }"
						/>
						<b-menu-item
							label="Configuration"
							icon="cog"
							exact-active-class="is-active"
							tag="router-link"
							:to="{ name: 'Configuration' }"
						/>
						<b-menu-item
							label="Administrative Settings"
							icon="wrench"
							exact-active-class="is-active"
							tag="router-link"
							:to="{ name: 'Administrative Settings' }"
						/>
						<b-menu-item
							label="Logs"
							icon="eye"
							exact-active-class="is-active"
							tag="router-link"
							:to="{ name: 'Logs' }"
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
};
</script>
