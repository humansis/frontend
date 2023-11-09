<template>
	<aside>
		<v-card>
			<v-layout>
				<v-navigation-drawer
					width="300"
					permanent
					expand-on-hover
					rail
					class="bg-deep-purple-lighten-3"
				>
					<v-list>
						<v-list-item
							prepend-avatar=""
						></v-list-item>
					</v-list>

					<v-divider></v-divider>

					<v-list>
						<template
							v-for="(sideBarItem, index) in sideBarItems"
							:key="index"
						>
							<v-list-item
								v-if="!sideBarItem.subItems?.length"
								:prepend-icon="sideBarItem.prependIcon"
								:title="sideBarItem.title"
							></v-list-item>

							<v-list-group
								v-else
								:value="sideBarItem.title"
							>
								<template v-slot:activator="{ props }">
									<v-list-item
										v-bind="props"
										prepend-icon="mdi-account-circle"
										title="Users"
									/>
								</template>

								<v-list-item
									v-for="(subItem, index) in sideBarItem.subItems"
									:key="index"
									:title="subItem.title"
									:prepend-icon="subItem.prependIcon"
									:value="subItem.title"
								></v-list-item>
							</v-list-group>
						</template>
					</v-list>
				</v-navigation-drawer>
			</v-layout>
		</v-card>
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
					prependIcon: "mdi-home",
				},
				{
					title: "Projects",
					prependIcon: "mdi-clipboard-text-outline",
				},
				{
					title: "Beneficiaries",
					prependIcon: "mdi-clipboard-text-outline",
					subItems: [
						{
							title: "Households",
							prependIcon: "mdi-clipboard-text-outline",
						},
						{
							title: "Institutions",
							prependIcon: "mdi-clipboard-text-outline",
						},
						{
							title: "Communities",
							prependIcon: "mdi-clipboard-text-outline",
						},
						{
							title: "Vendors",
							prependIcon: "mdi-clipboard-text-outline",
						},
					]
				},
				{
					title: "Imports",
					prependIcon: "mdi-clipboard-text-outline",
				},
				{
					title: "Reports",
					prependIcon: "mdi-clipboard-text-outline",
				},
				{
					title: "Vouchers",
					prependIcon: "mdi-clipboard-text-outline",
				},
				{
					title: "Country Settings",
					prependIcon: "mdi-clipboard-text-outline",
					subItems: [
						{
							title: "Products",
							prependIcon: "mdi-clipboard-text-outline",
						},
						{
							title: "Country specifics",
							prependIcon: "mdi-clipboard-text-outline",
						},
					]
				},
				{
					title: "Administrative Settings",
					prependIcon: "mdi-clipboard-text-outline",
				},
				{
					title: "Transactions",
					prependIcon: "mdi-clipboard-text-outline",
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
									children: []
								},
								{
									id: 4,
									name: "Fresh Vegetables",
									slug: "fresh-vegetable",
									children: []
								}
							]
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
									children: []
								}
							]
						}
					]
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
							children: []
						},
						{
							id: 9,
							name: "Cleaning Supplies",
							slug: "cleaning-supplies",
						}
					]
				}
			]
		};
	},

	computed: {
		...mapState([
			"isAsideVisible",
			"isAsideExpanded",
		]),

		environment() {
			return process.env.VUE_APP_ENV.toUpperCase();
		},

		organization() {
			return process.env.VUE_APP_ORGANIZATION;
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
			return `${process.env.VUE_APP_ENV}-aside-style`;
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

	destroyed() {
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

<style>
.git-info {
	position: absolute;
	bottom: 20px;
	padding: 4px;
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
	margin-bottom: 1px;
}

.git-info p strong {
	color: #ffffff;
}

.small-menu-item a {
	padding: .6rem 0 !important;
}
</style>
