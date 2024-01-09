<template>
	<aside>
		<v-navigation-drawer
			width="250"
			rail-width="50"
			permanent
			:rail="!isAsideExpanded"
			:class="`nav-bar bg-indigo-lighten-3 ${asideBackgroundClass}`"
		>
			<v-list>
				<v-list-item prepend-avatar="" class="side-menu-logo">
					<router-link :to="{ name: 'Home' }" class="hms-logo">
						<img src="@/assets/images/bms_logo.png" alt="">
					</router-link>
				</v-list-item>
			</v-list>

			<v-divider />

			<v-list density="compact" class="side-links" nav>
				<template
					v-for="(sideBarItem, index) in sideBarItems"
					:key="index"
				>
					<v-list-item
						v-if="!sideBarItem.subItems?.length && sideMenuItemsVisibility(sideBarItem)"
						:title="sideBarItem.title"
						:to="sideBarItem.to"
						:active="isRouteActive(sideBarItem)"
						exact
					>
						<template v-slot:prepend>
							<v-tooltip
								:text="sideBarItem.title"
								:disabled="isAsideExpanded"
								content-class="tooltip-right side-menu-tooltip"
							>
								<template v-slot:activator="{ props }">
									<v-icon
										v-bind="props"
										:icon="sideBarItem.prependIcon"
										size="small"
									/>
								</template>
							</v-tooltip>
						</template>
					</v-list-item>

					<v-list-group
						v-else-if="sideBarItem.subItems?.length && sideMenuItemsVisibility(sideBarItem)"
						:value="sideBarItem.title"
						fluid
					>
						<template v-slot:activator="{ props }">
							<v-list-item
								v-bind="props"
								:title="sideBarItem.title"
								:to="sideBarItem.to"
							>
								<template v-slot:prepend>
									<v-tooltip
										:text="sideBarItem.title"
										:disabled="isAsideExpanded"
										content-class="tooltip-right side-menu-tooltip"
									>
										<template v-slot:activator="{ props }">
											<v-icon
												v-bind="props"
												:icon="sideBarItem.prependIcon"
												size="small"
											/>
										</template>
									</v-tooltip>
								</template>
							</v-list-item>
						</template>

						<template v-for="(subItem, index) in sideBarItem.subItems" :key="index">
							<v-list-item
								v-if="sideMenuItemsVisibility(subItem)"
								:title="subItem.title"
								:to="subItem.to"
							>
								<template v-slot:prepend>
									<v-tooltip
										:text="subItem.title"
										:disabled="isAsideExpanded"
										content-class="tooltip-right side-menu-tooltip"
									>
										<template v-slot:activator="{ props }">
											<v-icon
												v-bind="props"
												:icon="subItem.prependIcon"
												size="small"
											/>
										</template>
									</v-tooltip>
								</template>
							</v-list-item>
						</template>
					</v-list-group>
				</template>
			</v-list>

			<div class="environment-info text-caption text-center">
				<p>{{ organization }}</p>

				<p><strong>{{ environment }}</strong></p>

				<p v-if="gitInfo.appVersion !== '__APP_VERSION__'">
					{{ appVersion }}
				</p>
			</div>
		</v-navigation-drawer>
	</aside>
</template>

<script>
import { mapState } from "vuex";
import permissions from "@/mixins/permissions";
import gitInfo from "@/gitInfo";

export default {
	name: "SideMenu",

	mixins: [permissions],

	data() {
		return {
			sideBarItems: [
				{
					title: "Home",
					prependIcon: "home",
					to: { name: "Home" },
				},
				{
					title: "Projects",
					prependIcon: "clipboard-list",
					to: { name: "Projects" },
					alias: [
						"Project",
						"AddProject",
						"ProjectDetail",
						"ProjectEdit",
						"AddAssistance",
						"AssistanceEdit",
						"AssistanceDetail",
					],
				},
				{
					title: "Beneficiaries",
					prependIcon: "user-friends",
					subItems: [
						{
							title: "Households",
							prependIcon: "home",
							to: { name: "Households" },
						},
						{
							title: "Institutions",
							prependIcon: "building",
							to: { name: "Institutions" },
						},
						{
							title: "Vendors",
							prependIcon: "store",
							to: { name: "Vendors" },
						},
					],
				},
				{
					title: "Imports",
					prependIcon: "file-import",
					to: { name: "Imports" },
				},
				{
					title: "Reports",
					prependIcon: "chart-line",
				},
				{
					title: "Vouchers",
					prependIcon: "ticket-alt",
					to: { name: "Vouchers" },
				},
				{
					title: "Country Settings",
					prependIcon: "globe-africa",
					subItems: [
						{
							title: "Products",
							prependIcon: "shopping-cart",
							to: { name: "Products" },
						},
						{
							title: "Country specifics",
							prependIcon: "map-marker-alt",
							to: { name: "CountrySpecific" },
						},
					],
				},
				{
					title: "Administrative Settings",
					prependIcon: "wrench",
					to: { name: "Administrative Settings" },
				},
				{
					title: "Transactions",
					prependIcon: "exchange-alt",
					to: { name: "TransactionsAssistances" },
				},
			],
			gitInfo,
			beneficiariesActive: false,
			countrySettingsActive: false,
			isSmallerMenuItem: false,
		};
	},

	computed: {
		...mapState([
			"isAsideExpanded",
		]),

		environment() {
			return import.meta.env.VITE_APP_ENV.toUpperCase();
		},

		organization() {
			return import.meta.env.VITE_APP_ORGANIZATION;
		},

		appVersion() {
			if (gitInfo.appVersion.includes("-")) {
				if (this.isAsideExpanded) {
					return gitInfo.appVersion;
				}
				const temp = gitInfo.appVersion.split("-");

				return temp[0];
			}

			return gitInfo.appVersion;
		},

		asideBackgroundClass() {
			return `${import.meta.env.VITE_APP_ENV}-aside-style`;
		},

		isCountrySettingsVisible() {
			return this.userCan.viewProducts
				|| this.userCan.countrySettings
				|| this.userCan.viewScoring;
		},
	},

	created() {
		if (this.isAsideExpanded) {
			this.$store.commit("asideStateToggle");
		}
	},

	mounted() {
		this.checkScreenHeight();

		window.addEventListener("resize", this.checkScreenHeight);
	},

	unmounted() {
		window.removeEventListener("resize", this.checkScreenHeight);
	},

	methods: {
		checkScreenHeight() {
			this.isSmallerMenuItem = window.innerHeight < 480;
		},

		isRouteActive(item) {
			const actualRoute = this.$route.name;

			return actualRoute === item.to?.name || item.alias?.includes(actualRoute);
		},

		sideMenuItemsVisibility({ title }) {
			switch (title) {
				case "Vendors":
					return this.userCan.viewVendors;
				case "Vouchers":
					return this.userCan.viewVouchers;
				case "Country Settings":
					return this.isCountrySettingsVisible;
				case "Products":
					return this.userCan.viewProducts;
				case "Country specifics":
					return this.userCan.countrySettings || this.userCan.viewScoring;
				case "Administrative Settings":
					return this.userCan.adminSettings;
				default:
					return true;
			}
		},
	},
};
</script>

<style lang="scss" scoped>
.side-menu-logo {
	:deep(.v-list-item__content) {
		margin: auto auto;
	}

	a {
		margin: 0 0 0 -.5rem;

		img {
			flex-shrink: 0;
			width: auto;
			max-width: 1.6rem;
			height: auto;
			font-size: 2rem;
			box-sizing: content-box;
			border-radius: 50%;
			padding: .25rem;
			background: #fbfcfc;
		}
	}
}

.environment-info {
	position: absolute;
	bottom: 1.75rem;
}
</style>

<style lang="scss">
.v-list-item__content:has(> .hms-logo) {
	overflow: visible;
}

.side-menu-tooltip.tooltip-right {
	left: 3.75rem !important;
}
</style>
