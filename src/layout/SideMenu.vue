<template>
	<aside>
		<b-sidebar
			fullheight
			open
			expand-on-hover
			reduce
			:fullwidth="false"
			:overlay="false"
			:right="false"
			:can-cancel="false"
		>
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
								icon="home"
								exact-active-class="is-active"
								tag="router-link"
								:to="{ name: 'Households' }"
							/>
							<b-menu-item
								label="Institutions"
								icon="building"
								exact-active-class="is-active"
								tag="router-link"
								:to="{ name: 'Institutions' }"
							/>
							<b-menu-item
								label="Communities"
								icon="users"
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
							class="to-dropdown-item"
						>
							<b-menu-item
								label="Vendors"
								icon="store"
								exact-active-class="is-active"
								tag="router-link"
								:to="{ name: 'Vendors' }"
							/>
							<b-menu-item
								label="Products"
								icon="shopping-cart"
								exact-active-class="is-active"
								tag="router-link"
								:to="{ name: 'Products' }"
							/>
							<b-menu-item
								label="Country specifics"
								icon="map-marker-alt"
								exact-active-class="is-active"
								tag="router-link"
								:to="{ name: 'CountrySpecifics' }"
							/>
						</b-menu-item>
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
