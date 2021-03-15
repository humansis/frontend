<template>
	<aside
		v-show="isAsideVisible"
		class="aside is-placed-left"
		:class="{'is-expanded': isAsideExpanded}"
	>
		<div ref="container" class="aside-container">
			<div class="image">
				<img src="../assets/images/bms_logo.png" alt="" class="bms-logo">
			</div>
			<div class="menu">
				<b-menu>
					<b-menu-list>
						<b-menu-item
							icon="home"
							exact-active-class="is-active"
							tag="router-link"
							:to="{ name: 'Home' }"
						>
							<template #label>
								<b-tooltip label="Home" position="is-right" always>
									Home
								</b-tooltip>
							</template>
						</b-menu-item>
						<b-menu-item
							icon="clipboard-list"
							exact-active-class="is-active"
							tag="router-link"
							:to="{ name: 'Projects' }"
						>
							<template #label>
								<b-tooltip label="Projects" position="is-right" always>
									Projects
								</b-tooltip>
							</template>
						</b-menu-item>
						<b-menu-item
							icon="user-friends"
							class="to-dropdown-item"
						>
							<template #label>
								<b-tooltip label="Beneficiaries" position="is-right" always>
									Beneficiaries
								</b-tooltip>
							</template>
							<b-menu-item
								icon="home"
								exact-active-class="is-active"
								tag="router-link"
								:to="{ name: 'Households' }"
							>
								<template #label>
									<b-tooltip label="Households" position="is-right" always>
										Households
									</b-tooltip>
								</template>
							</b-menu-item>
							<b-menu-item
								icon="building"
								exact-active-class="is-active"
								tag="router-link"
								:to="{ name: 'Institutions' }"
							>
								<template #label>
									<b-tooltip label="Institutions" position="is-right" always>
										Institutions
									</b-tooltip>
								</template>
							</b-menu-item>
							<b-menu-item
								icon="users"
								exact-active-class="is-active"
								tag="router-link"
								:to="{ name: 'Communities' }"
							>
								<template #label>
									<b-tooltip label="Communities" position="is-right" always>
										Communities
									</b-tooltip>
								</template>
							</b-menu-item>
							<b-menu-item
								icon="store"
								exact-active-class="is-active"
								tag="router-link"
								:to="{ name: 'Vendors' }"
							>
								<template #label>
									<b-tooltip label="Vendors" position="is-right" always>
										Vendors
									</b-tooltip>
								</template>
							</b-menu-item>
						</b-menu-item>
						<b-menu-item
							icon="chart-line"
							exact-active-class="is-active"
							tag="router-link"
							:to="{ name: 'Reports' }"
						>
							<template #label>
								<b-tooltip label="Reports" position="is-right" always>
									Reports
								</b-tooltip>
							</template>
						</b-menu-item>
						<b-menu-item
							icon="ticket-alt"
							exact-active-class="is-active"
							tag="router-link"
							:to="{ name: 'Vouchers' }"
						>
							<template #label>
								<b-tooltip label="Vouchers" position="is-right" always>
									Vouchers
								</b-tooltip>
							</template>
						</b-menu-item>
						<b-menu-item
							icon="cog"
							class="to-dropdown-item"
						>
							<template #label>
								<b-tooltip label="Configuration" position="is-right" always>
									Configuration
								</b-tooltip>
							</template>
							<b-menu-item
								icon="shopping-cart"
								exact-active-class="is-active"
								tag="router-link"
								:to="{ name: 'Products' }"
							>
								<template #label>
									<b-tooltip label="Products" position="is-right" always>
										Products
									</b-tooltip>
								</template>
							</b-menu-item>
							<b-menu-item
								icon="map-marker-alt"
								exact-active-class="is-active"
								tag="router-link"
								:to="{ name: 'CountrySpecificOptions' }"
							>
								<template #label>
									<b-tooltip label="Country specifics" position="is-right" always>
										Country specifics
									</b-tooltip>
								</template>
							</b-menu-item>
						</b-menu-item>
						<b-menu-item
							icon="wrench"
							exact-active-class="is-active"
							tag="router-link"
							:to="{ name: 'Administrative Settings' }"
						>
							<template #label>
								<b-tooltip label="Administrative Settings" position="is-right" always>
									Administrative Settings
								</b-tooltip>
							</template>
						</b-menu-item>
						<b-menu-item
							icon="credit-card"
							exact-active-class="is-active"
							tag="router-link"
							:to="{ name: 'Transactions' }"
						>
							<template #label>
								<b-tooltip label="Transactions" position="is-right" always>
									Transactions
								</b-tooltip>
							</template>
						</b-menu-item>
						<b-menu-item
							icon="briefcase"
							exact-active-class="is-active"
							tag="router-link"
							:to="{ name: 'Jobs' }"
						>
							<template #label>
								<b-tooltip label="Jobs" position="is-right" always>
									Jobs
								</b-tooltip>
							</template>
						</b-menu-item>
						<b-menu-item
							icon="eye"
							exact-active-class="is-active"
							tag="router-link"
							:to="{ name: 'Logs' }"
						>
							<template #label>
								<b-tooltip label="Logs" position="is-right" always>
									Logs
								</b-tooltip>
							</template>
						</b-menu-item>
					</b-menu-list>
				</b-menu>
			</div>
		</div>
	</aside>
</template>

<script>
import { mapState } from "vuex";

export default {
	name: "SideMenu",

	computed: {
		...mapState([
			"isAsideVisible",
			"isAsideExpanded",
		]),
	},

	created() {
		if (this.isAsideExpanded) {
			this.$store.commit("asideStateToggle");
		}
	},
};
</script>
