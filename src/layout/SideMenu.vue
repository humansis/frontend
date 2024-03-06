<template>
	<aside>
		<v-navigation-drawer
			width="250"
			rail-width="50"
			permanent
			:rail="!isAsideExpanded"
			:class="`nav-bar bg-indigo-lighten-3 ${asideBackgroundClass}`"
		>
			<div>
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
							v-if="sideBarItem?.href"
							:title="$t(sideBarItem.title)"
							:href="sideBarItem.href"
							:active="isRouteActive(sideBarItem)"
							target="_blank"
							rel="noopener noreferrer"
							exact
						>
							<template v-slot:prepend>
								<v-tooltip
									:disabled="isAsideExpanded"
									content-class="tooltip-right side-menu-tooltip"
								>
									<template v-slot:default>
										<div class="d-flex align-center gc-2">
											<span>{{ $t(sideBarItem.title) }}</span>

											<v-icon :icon="sideBarItem?.tooltipIcon" size="small" />
										</div>
									</template>

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

						<v-list-item
							v-if="isItemWithoutSubItems(sideBarItem)"
							:title="$t(sideBarItem.title)"
							:to="sideBarItem.to"
							:active="isRouteActive(sideBarItem)"
							exact
						>
							<template v-slot:prepend>
								<v-tooltip
									:text="$t(sideBarItem.title)"
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
							v-else-if="isItemWithSubItems(sideBarItem)"
							:value="sideBarItem.title"
							fluid
						>
							<template v-slot:activator="{ props }">
								<v-list-item
									v-bind="props"
									:title="$t(sideBarItem.title)"
									:to="sideBarItem.to"
								>
									<template v-slot:prepend>
										<v-tooltip
											:text="$t(sideBarItem.title)"
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
									:title="$t(subItem.title)"
									:to="subItem.to"
								>
									<template v-slot:prepend>
										<v-tooltip
											:text="$t(subItem.title)"
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
			</div>

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
					href: "https://app.powerbi.com/reportEmbed?reportId=d5a81245-560f-4114-bd05-525ddf55ceea&appId=92536ae3-49e4-4156-92a1-ba70dee78455&autoAuth=true&ctid=c8342453-69ce-4b7b-a3e2-cda219f2985e&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly93YWJpLWV1cm9wZS1ub3J0aC1iLXJlZGlyZWN0LmFuYWx5c2lzLndpbmRvd3MubmV0LyJ9",
					tooltipIcon: "external-link-alt",
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

		isItemWithoutSubItems(sideBarItem) {
			return !sideBarItem.subItems?.length
				&& this.sideMenuItemsVisibility(sideBarItem)
				&& !sideBarItem?.href;
		},

		isItemWithSubItems(sideBarItem) {
			return sideBarItem.subItems?.length
				&& this.sideMenuItemsVisibility(sideBarItem)
				&& !sideBarItem?.href;
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
	width: 100%;
	margin-bottom: 1.5rem;
}
</style>

<style lang="scss">
.v-navigation-drawer__content {
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}

.v-list-item__content:has(> .hms-logo) {
	overflow: visible;
}

.side-menu-tooltip.tooltip-right {
	left: 3.75rem !important;
}
</style>
