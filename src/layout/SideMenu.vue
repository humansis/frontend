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
						<router-link :to="{ name: ROUTER.ROUTE_NAME.HOME }" class="hms-logo">
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
							:disabled="!isUserPermissionGranted(sideBarItem.requiredPermissions)"
							:data-cy="identifierBuilder(`${sideBarItem.title}-button`, false)"
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
							:to="getRouteAddress(sideBarItem)"
							:active="isRouteActive(sideBarItem)"
							:disabled="!isUserPermissionGranted(sideBarItem.requiredPermissions)"
							:data-cy="identifierBuilder(`${sideBarItem.title}-button`, false)"
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
							:data-cy="identifierBuilder(`${sideBarItem.title}-button`, false)"
							fluid
						>
							<template v-slot:activator="{ props }">
								<v-list-item
									v-bind="props"
									:title="$t(sideBarItem.title)"
									:to="getRouteAddress(sideBarItem)"
									:disabled="!isUserPermissionGranted(sideBarItem.requiredPermissions)"
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
									:title="$t(subItem.title)"
									:to="getRouteAddress(subItem)"
									:disabled="!isUserPermissionGranted(subItem.requiredPermissions)"
									:data-cy="identifierBuilder(`${subItem.title}-button`, false)"
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
import identifierBuilder from "@/mixins/identifierBuilder";
import permissions from "@/mixins/permissions";
import { PERMISSIONS, ROUTER } from "@/consts";
import gitInfo from "@/gitInfo";

export default {
	name: "SideMenu",

	mixins: [permissions, identifierBuilder],

	data() {
		return {
			ROUTER,
			dataCy: "side-menu",
			sideBarItems: [
				{
					title: "Home",
					prependIcon: "home",
					to: { name: ROUTER.ROUTE_NAME.HOME },
					requiredPermissions: PERMISSIONS.HOME_PAGE,
				},
				{
					title: "Projects",
					prependIcon: "clipboard-list",
					to: { name: ROUTER.ROUTE_NAME.PROJECTS.ROOT },
					requiredPermissions: PERMISSIONS.PROJECT_MANAGEMENT,
					alias: [
						ROUTER.ROUTE_NAME.PROJECTS.ROOT,
						ROUTER.ROUTE_NAME.PROJECTS.ADD,
						ROUTER.ROUTE_NAME.PROJECTS.EDIT,
						ROUTER.ROUTE_NAME.PROJECTS.DETAIL,
						ROUTER.ROUTE_NAME.ASSISTANCES.ROOT,
						ROUTER.ROUTE_NAME.ASSISTANCES.ADD,
						ROUTER.ROUTE_NAME.ASSISTANCES.EDIT,
						ROUTER.ROUTE_NAME.ASSISTANCES.DETAIL,
						ROUTER.ROUTE_NAME.ASSISTANCES.CREATION_PROGRESS,
					],
				},
				{
					title: "Beneficiaries",
					prependIcon: "user-friends",
					subItems: [
						{
							title: "Households",
							prependIcon: "home",
							to: { name: ROUTER.ROUTE_NAME.HOUSEHOLDS.ROOT },
							requiredPermissions: PERMISSIONS.HOUSEHOLD,
						},
						{
							title: "Institutions",
							prependIcon: "building",
							to: { name: ROUTER.ROUTE_NAME.INSTITUTIONS.ROOT },
							requiredPermissions: PERMISSIONS.INSTITUTION,
						},
						{
							title: "Vendors",
							prependIcon: "store",
							to: { name: ROUTER.ROUTE_NAME.VENDORS },
							requiredPermissions: PERMISSIONS.VENDOR,
						},
					],
				},
				{
					title: "Imports",
					prependIcon: "file-import",
					to: { name: ROUTER.ROUTE_NAME.IMPORTS.ROOT },
					requiredPermissions: PERMISSIONS.IMPORT,
				},
				{
					title: "Reports",
					prependIcon: "chart-line",
					href: "https://app.powerbi.com/reportEmbed?reportId=d5a81245-560f-4114-bd05-525ddf55ceea&appId=92536ae3-49e4-4156-92a1-ba70dee78455&autoAuth=true&ctid=c8342453-69ce-4b7b-a3e2-cda219f2985e&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly93YWJpLWV1cm9wZS1ub3J0aC1iLXJlZGlyZWN0LmFuYWx5c2lzLndpbmRvd3MubmV0LyJ9",
					tooltipIcon: "external-link-alt",
					requiredPermissions: PERMISSIONS.REPORTS,
				},
				{
					title: "Vouchers",
					prependIcon: "ticket-alt",
					to: { name: ROUTER.ROUTE_NAME.VOUCHERS },
					requiredPermissions: PERMISSIONS.VOUCHERS,
				},
				{
					title: "Country Settings",
					prependIcon: "globe-africa",
					subItems: [
						{
							title: "Products",
							prependIcon: "shopping-cart",
							to: { name: ROUTER.ROUTE_NAME.PRODUCTS },
							requiredPermissions: PERMISSIONS.COUNTRY_SETTINGS_PRODUCT_ITEMS,
						},
						{
							title: "Country specifics",
							prependIcon: "map-marker-alt",
							to: { name: ROUTER.ROUTE_NAME.COUNTRY_SPECIFICS },
						},
					],
				},
				{
					title: "Administrative Settings",
					prependIcon: "wrench",
					to: { name: ROUTER.ROUTE_NAME.ADMINISTRATIVE_SETTINGS },
					requiredPermissions: PERMISSIONS.ADMINISTRATIVE_SETTING,
				},
				{
					title: "Transactions",
					prependIcon: "exchange-alt",
					to: { name: ROUTER.ROUTE_NAME.TRANSACTIONS.ASSISTANCES },
					requiredPermissions: PERMISSIONS.TRANSACTIONS,
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
			return !sideBarItem.subItems?.length && !sideBarItem?.href;
		},

		isItemWithSubItems(sideBarItem) {
			return sideBarItem.subItems?.length && !sideBarItem?.href;
		},

		getRouteAddress(sideBarItem) {
			return this.isUserPermissionGranted(sideBarItem.requiredPermissions)
				? sideBarItem.to
				: null;
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
	-ms-overflow-style: none;

	&::-webkit-scrollbar {
		display: none;
	}
}

.v-list-item__content:has(> .hms-logo) {
	overflow: visible;
}

.side-menu-tooltip.tooltip-right {
	left: 3.75rem !important;
}
</style>
