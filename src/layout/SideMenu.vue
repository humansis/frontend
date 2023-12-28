<template>
	<aside>
		<v-navigation-drawer
			width="250"
			rail-width="50"
			permanent
			:rail="!isAsideExpanded"
			class="bg-indigo-lighten-3"
		>
			<v-list>
				<v-list-item prepend-avatar="" class="side-menu-logo">
					<router-link :to="{ name: 'Home' }" class="hms-logo">
						<img src="@/assets/images/bms_logo.png" alt="">
					</router-link>
				</v-list-item>
			</v-list>

			<v-divider />

			<v-list density="compact" nav>
				<template
					v-for="(sideBarItem, index) in sideBarItems"
					:key="index"
				>
					<v-list-item
						v-if="!sideBarItem.subItems?.length"
						:title="sideBarItem.title"
						:to="sideBarItem.to"
						exact
					>
						<template v-slot:prepend>
							<v-tooltip :text="sideBarItem.title" :disabled="isAsideExpanded">
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
						v-else
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

						<v-list-item
							v-for="(subItem, index) in sideBarItem.subItems"
							:key="index"
							:title="subItem.title"
							:to="subItem.to"
						>
							<template v-slot:prepend>
								<v-tooltip
									:text="subItem.title"
									:disabled="isAsideExpanded"
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
					</v-list-group>
				</template>
			</v-list>

			<div class="git-info">
				<p>{{ organization }}</p>

				<p><strong>{{ environment }}</strong></p>

				<p v-if="gitInfo.appVersion !== '__APP_VERSION__'">
					{{ appVersion }}
				</p>
			</div>
		</v-navigation-drawer>
	</aside>
<!--	<aside-->
<!--		v-show="isAsideVisible"-->
<!--		class="aside is-placed-left"-->
<!--		:class="[asideBackgroundClass, {'is-expanded': isAsideExpanded}]"-->
<!--	>-->
<!--		<div ref="container" class="aside-container">-->
<!--			<div class="image">-->
<!--				<router-link :to="{ name: 'Home' }">-->
<!--					<img src="@/assets/images/bms_logo.png" alt="" class="bms-logo">-->
<!--				</router-link>-->
<!--			</div>-->
<!--			<div class="git-info">-->
<!--				<p>{{ organization }}</p>-->
<!--				<p><strong>{{ environment }}</strong></p>-->
<!--				<p v-if="gitInfo.appVersion !== '__APP_VERSION__'">-->
<!--					{{ appVersion }}-->
<!--				</p>-->
<!--			</div>-->
<!--			<div class="menu">-->
<!--				<b-menu :activable="false">-->
<!--					<b-menu-list>-->
<!--						<b-menu-item-->
<!--							icon="home"-->
<!--							exact-active-class="is-active"-->
<!--							tag="router-link"-->
<!--							:to="{ name: 'Home' }"-->
<!--							:class="{ 'small-menu-item': isSmallerMenuItem }"-->
<!--						>-->
<!--							<template #label>-->
<!--								<b-tooltip :label="$t('Home')" position="is-right" always>-->
<!--									{{ $t('Home') }}-->
<!--								</b-tooltip>-->
<!--							</template>-->
<!--						</b-menu-item>-->
<!--						<b-menu-item-->
<!--							:active="isProjectsActive()"-->
<!--							icon="clipboard-list"-->
<!--							exact-active-class="is-active"-->
<!--							tag="router-link"-->
<!--							:to="{ name: 'Projects' }"-->
<!--							:class="{ 'small-menu-item': isSmallerMenuItem }"-->
<!--						>-->
<!--							<template #label>-->
<!--								<b-tooltip :label="$t('Projects')" position="is-right" always>-->
<!--									{{ $t('Projects') }}-->
<!--								</b-tooltip>-->
<!--							</template>-->
<!--						</b-menu-item>-->
<!--						<b-menu-item-->
<!--							icon="user-friends"-->
<!--							class="to-dropdown-item"-->
<!--							:active="beneficiariesActive"-->
<!--							:class="{ 'small-menu-item': isSmallerMenuItem }"-->
<!--							@click="beneficiariesActive = !beneficiariesActive"-->
<!--						>-->
<!--							<template #label>-->
<!--								<b-tooltip :label="$t('Beneficiaries')" position="is-right" always>-->
<!--									{{ $t('Beneficiaries') }}-->
<!--								</b-tooltip>-->
<!--							</template>-->
<!--							<b-menu-item-->
<!--								icon="home"-->
<!--								class="nested-item"-->
<!--								exact-active-class="is-active"-->
<!--								tag="router-link"-->
<!--								:to="{ name: 'Households' }"-->
<!--								:class="{ 'small-menu-item': isSmallerMenuItem }"-->
<!--							>-->
<!--								<template #label>-->
<!--									<b-tooltip :label="$t('Households')" position="is-right" always>-->
<!--										{{ $t('Households') }}-->
<!--									</b-tooltip>-->
<!--								</template>-->
<!--							</b-menu-item>-->
<!--							<b-menu-item-->
<!--								icon="building"-->
<!--								class="nested-item"-->
<!--								exact-active-class="is-active"-->
<!--								tag="router-link"-->
<!--								:to="{ name: 'Institutions' }"-->
<!--								:class="{ 'small-menu-item': isSmallerMenuItem }"-->
<!--							>-->
<!--								<template #label>-->
<!--									<b-tooltip :label="$t('Institutions')" position="is-right" always>-->
<!--										{{ $t('Institutions') }}-->
<!--									</b-tooltip>-->
<!--								</template>-->
<!--							</b-menu-item>-->
<!--							<b-menu-item-->
<!--								icon="users"-->
<!--								class="nested-item"-->
<!--								exact-active-class="is-active"-->
<!--								tag="router-link"-->
<!--								:to="{ name: 'Communities' }"-->
<!--								:class="{ 'small-menu-item': isSmallerMenuItem }"-->
<!--							>-->
<!--								<template #label>-->
<!--									<b-tooltip :label="$t('Communities')" position="is-right" always>-->
<!--										{{ $t('Communities') }}-->
<!--									</b-tooltip>-->
<!--								</template>-->
<!--							</b-menu-item>-->
<!--							<b-menu-item-->
<!--								v-if="userCan.viewVendors"-->
<!--								class="nested-item"-->
<!--								icon="store"-->
<!--								exact-active-class="is-active"-->
<!--								tag="router-link"-->
<!--								:to="{ name: 'Vendors' }"-->
<!--								:class="{ 'small-menu-item': isSmallerMenuItem }"-->
<!--							>-->
<!--								<template #label>-->
<!--									<b-tooltip :label="$t('Vendors')" position="is-right" always>-->
<!--										{{ $t('Vendors') }}-->
<!--									</b-tooltip>-->
<!--								</template>-->
<!--							</b-menu-item>-->
<!--						</b-menu-item>-->
<!--						<b-menu-item-->
<!--							icon="file-import"-->
<!--							exact-active-class="is-active"-->
<!--							tag="router-link"-->
<!--							:to="{ name: 'Imports' }"-->
<!--							:class="{ 'small-menu-item': isSmallerMenuItem }"-->
<!--						>-->
<!--							<template #label>-->
<!--								<b-tooltip :label="$t('Imports')" position="is-right" always>-->
<!--									{{ $t('Imports') }}-->
<!--								</b-tooltip>-->
<!--							</template>-->
<!--						</b-menu-item>-->
<!--						<b-menu-item-->
<!--							icon="chart-line"-->
<!--							tag="a"-->
<!--							href="https://app.powerbi.com/reportEmbed?reportId=d5a81245-560f-4114-bd05-525ddf55ceea&appId=92536ae3-49e4-4156-92a1-ba70dee78455&autoAuth=true&ctid=c8342453-69ce-4b7b-a3e2-cda219f2985e&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly93YWJpLWV1cm9wZS1ub3J0aC1iLXJlZGlyZWN0LmFuYWx5c2lzLndpbmRvd3MubmV0LyJ9"-->
<!--							target="_blank"-->
<!--							:class="{ 'small-menu-item': isSmallerMenuItem }"-->
<!--						>-->
<!--							<template #label>-->
<!--								<b-tooltip position="is-right" always>-->
<!--									{{ $t('Reports') }}-->
<!--									<b-icon icon="external-link-alt" size="is-small" />-->

<!--									<template #content>-->
<!--										{{ $t('Reports') }}-->
<!--										<b-icon icon="external-link-alt" size="is-small" />-->
<!--									</template>-->
<!--								</b-tooltip>-->
<!--							</template>-->
<!--						</b-menu-item>-->
<!--						<b-menu-item-->
<!--							v-if="userCan.viewVouchers"-->
<!--							icon="ticket-alt"-->
<!--							exact-active-class="is-active"-->
<!--							tag="router-link"-->
<!--							:to="{ name: 'Vouchers' }"-->
<!--							:class="{ 'small-menu-item': isSmallerMenuItem }"-->
<!--						>-->
<!--							<template #label>-->
<!--								<b-tooltip :label="$t('Vouchers')" position="is-right" always>-->
<!--									{{ $t('Vouchers') }}-->
<!--								</b-tooltip>-->
<!--							</template>-->
<!--						</b-menu-item>-->
<!--						<b-menu-item-->
<!--							v-if="isCountrySettingsVisible"-->
<!--							icon="globe-africa"-->
<!--							class="to-dropdown-item"-->
<!--							:active="countrySettingsActive"-->
<!--							:class="{ 'small-menu-item': isSmallerMenuItem }"-->
<!--							@click="countrySettingsActive = !countrySettingsActive"-->
<!--						>-->
<!--							<template #label>-->
<!--								<b-tooltip :label="$t('Country Settings')" position="is-right" always>-->
<!--									{{ $t('Country Settings') }}-->
<!--								</b-tooltip>-->
<!--							</template>-->
<!--							<b-menu-item-->
<!--								v-if="userCan.viewProducts"-->
<!--								class="nested-item"-->
<!--								icon="shopping-cart"-->
<!--								exact-active-class="is-active"-->
<!--								tag="router-link"-->
<!--								:to="{ name: 'Products' }"-->
<!--								:class="{ 'small-menu-item': isSmallerMenuItem }"-->
<!--							>-->
<!--								<template #label>-->
<!--									<b-tooltip :label="$t('Products')" position="is-right" always>-->
<!--										{{ $t('Products') }}-->
<!--									</b-tooltip>-->
<!--								</template>-->
<!--							</b-menu-item>-->
<!--							<b-menu-item-->
<!--								v-if="userCan.countrySettings || userCan.viewScoring"-->
<!--								class="nested-item"-->
<!--								icon="map-marker-alt"-->
<!--								exact-active-class="is-active"-->
<!--								tag="router-link"-->
<!--								:to="{ name: 'CountrySpecific' }"-->
<!--								:class="{ 'small-menu-item': isSmallerMenuItem }"-->
<!--							>-->
<!--								<template #label>-->
<!--									<b-tooltip :label="$t('Country specifics')" position="is-right" always>-->
<!--										{{ $t('Country specifics') }}-->
<!--									</b-tooltip>-->
<!--								</template>-->
<!--							</b-menu-item>-->
<!--						</b-menu-item>-->
<!--						<b-menu-item-->
<!--							v-if="userCan.adminSettings"-->
<!--							icon="wrench"-->
<!--							exact-active-class="is-active"-->
<!--							tag="router-link"-->
<!--							:to="{ name: 'Administrative Settings' }"-->
<!--							:class="{ 'small-menu-item': isSmallerMenuItem }"-->
<!--						>-->
<!--							<template #label>-->
<!--								<b-tooltip :label="$t('Administrative Settings')" position="is-right" always>-->
<!--									{{ $t('Administrative Settings') }}-->
<!--								</b-tooltip>-->
<!--							</template>-->
<!--						</b-menu-item>-->
<!--						<b-menu-item-->
<!--							icon="exchange-alt"-->
<!--							exact-active-class="is-active"-->
<!--							tag="router-link"-->
<!--							:to="{ name: 'TransactionsAssistances' }"-->
<!--							:class="{ 'small-menu-item': isSmallerMenuItem }"-->
<!--						>-->
<!--							<template #label>-->
<!--								<b-tooltip :label="$t('Transactions')" position="is-right" always>-->
<!--									Transactions-->
<!--								</b-tooltip>-->
<!--							</template>-->
<!--						</b-menu-item>-->
<!--					</b-menu-list>-->
<!--				</b-menu>-->
<!--			</div>-->
<!--		</div>-->
<!--	</aside>-->
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
				},
				{
					title: "Beneficiaries",
					prependIcon: "user-friends",
					subItems: [
						{
							title: "Households",
							prependIcon: "home",
							// to: { name: "Households" },
						},
						{
							title: "Institutions",
							prependIcon: "building",
							to: { name: "Institutions" },
						},
						{
							title: "Vendors",
							prependIcon: "store",
							// to: { name: "Vendors" },
						},
					],
				},
				{
					title: "Imports",
					prependIcon: "file-import",
				},
				{
					title: "Reports",
					prependIcon: "chart-line",
				},
				{
					title: "Vouchers",
					prependIcon: "ticket-alt",
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
				},
				{
					title: "Transactions",
					prependIcon: "exchange-alt",
				},
			],
			gitInfo,
			beneficiariesActive: false,
			countrySettingsActive: false,
			isSmallerMenuItem: false,
			test: [
				{
					id: 1,
					name: "Food",
					slug: "food",
					children: [
						{
							id: 2,
							name: "Fruits & Vegetables",
							slug: "fruits-vegetables",
							children: [
								{
									id: 3,
									name: "Fresh Fruits",
									slug: "fresh-fruit",
									children: [],
								},
								{
									id: 4,
									name: "Fresh Vegetables",
									slug: "fresh-vegetable",
									children: [],
								},
							],
						},
						{
							id: 5,
							name: "Breakfast",
							slug: "breakfast",
							children: [
								{
									id: 6,
									name: "Local Breakfast",
									slug: "local-breakfast",
									children: [],
								},
							],
						},
					],
				},
				{
					id: 7,
					name: "Home & Cleaning",
					slug: "home-cleaning",
					children: [
						{
							id: 8,
							name: "Air Fresheners",
							slug: "air-freshners",
							children: [],
						},
						{
							id: 9,
							name: "Cleaning Supplies",
							slug: "cleaning-supplies",
						},
					],
				},
			],
		};
	},

	computed: {
		...mapState([
			"isAsideVisible",
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

		isProjectsActive() {
			const { name } = this.$route;

			return name === "Project"
				|| name === "AssistanceEdit"
				|| name === "AssistanceDetail"
				|| name === "AddAssistance";
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

.v-list-item__content:has(> .hms-logo) {
	overflow: visible;
}

.git-info {
	position: absolute;
	bottom: 1.25rem;
	padding: .25rem;
	color: #ffffff;
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 100%;
	font-size: .9rem;
	pointer-events: none;
	opacity: .8;
	line-height: 1.2;
}

.git-info p {
	text-align: center;
	margin-bottom: .0625rem;
}

.git-info p strong {
	color: #ffffff;
}

.small-menu-item a {
	padding: .6rem 0 !important;
}
</style>

<style>
.v-list-item__content:has(> .hms-logo) {
	overflow: visible;
}
</style>
