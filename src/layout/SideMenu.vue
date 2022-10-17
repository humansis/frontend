<template>
	<aside
		v-show="isAsideVisible"
		class="aside is-placed-left"
		:class="[asideBackgroundClass, {'is-expanded': isAsideExpanded}]"
	>
		<div ref="container" class="aside-container">
			<div class="image">
				<router-link
					:to="{ name: 'Home', params: { country: countryUrlParam } }"
				>
					<img src="@/assets/images/bms_logo.png" alt="" class="bms-logo">
				</router-link>
			</div>
			<div class="git-info">
				<p>{{ organization }}</p>
				<p><strong>{{ environment }}</strong></p>
				<p v-if="gitInfo.appVersion !== '__APP_VERSION__'">
					{{ appVersion }}
				</p>
			</div>
			<div class="menu">
				<b-menu :activable="false">
					<b-menu-list>
						<b-menu-item
							icon="home"
							exact-active-class="is-active"
							tag="router-link"
							:to="{ name: 'Home', params: { country: countryUrlParam } }"
							:class="{ 'small-menu-item': isSmallerMenuItem }"
						>
							<template #label>
								<b-tooltip :label="$t('Home')" position="is-right" always>
									{{ $t('Home') }}
								</b-tooltip>
							</template>
						</b-menu-item>
						<b-menu-item
							:active="isProjectsActive()"
							icon="clipboard-list"
							exact-active-class="is-active"
							tag="router-link"
							:to="{ name: 'Projects', params: { country: countryUrlParam } }"
							:class="{ 'small-menu-item': isSmallerMenuItem }"
						>
							<template #label>
								<b-tooltip :label="$t('Projects')" position="is-right" always>
									{{ $t('Projects') }}
								</b-tooltip>
							</template>
						</b-menu-item>
						<b-menu-item
							icon="user-friends"
							class="to-dropdown-item"
							:active="beneficiariesActive"
							:class="{ 'small-menu-item': isSmallerMenuItem }"
							@click="beneficiariesActive = !beneficiariesActive"
						>
							<template #label>
								<b-tooltip :label="$t('Beneficiaries')" position="is-right" always>
									{{ $t('Beneficiaries') }}
								</b-tooltip>
							</template>
							<b-menu-item
								icon="home"
								class="nested-item"
								exact-active-class="is-active"
								tag="router-link"
								:to="{ name: 'Households', params: { country: countryUrlParam } }"
								:class="{ 'small-menu-item': isSmallerMenuItem }"
							>
								<template #label>
									<b-tooltip :label="$t('Households')" position="is-right" always>
										{{ $t('Households') }}
									</b-tooltip>
								</template>
							</b-menu-item>
							<b-menu-item
								icon="building"
								class="nested-item"
								exact-active-class="is-active"
								tag="router-link"
								:to="{ name: 'Institutions', params: { country: countryUrlParam } }"
								:class="{ 'small-menu-item': isSmallerMenuItem }"
							>
								<template #label>
									<b-tooltip :label="$t('Institutions')" position="is-right" always>
										{{ $t('Institutions') }}
									</b-tooltip>
								</template>
							</b-menu-item>
							<b-menu-item
								icon="users"
								class="nested-item"
								exact-active-class="is-active"
								tag="router-link"
								:to="{ name: 'Communities', params: { country: countryUrlParam } }"
								:class="{ 'small-menu-item': isSmallerMenuItem }"
							>
								<template #label>
									<b-tooltip :label="$t('Communities')" position="is-right" always>
										{{ $t('Communities') }}
									</b-tooltip>
								</template>
							</b-menu-item>
							<b-menu-item
								v-if="userCan.viewVendors"
								class="nested-item"
								icon="store"
								exact-active-class="is-active"
								tag="router-link"
								:to="{ name: 'Vendors', params: { country: countryUrlParam } }"
								:class="{ 'small-menu-item': isSmallerMenuItem }"
							>
								<template #label>
									<b-tooltip :label="$t('Vendors')" position="is-right" always>
										{{ $t('Vendors') }}
									</b-tooltip>
								</template>
							</b-menu-item>
						</b-menu-item>
						<b-menu-item
							icon="file-import"
							exact-active-class="is-active"
							tag="router-link"
							:to="{ name: 'Imports', params: { country: countryUrlParam } }"
							:class="{ 'small-menu-item': isSmallerMenuItem }"
						>
							<template #label>
								<b-tooltip :label="$t('Imports')" position="is-right" always>
									{{ $t('Imports') }}
								</b-tooltip>
							</template>
						</b-menu-item>
						<b-menu-item
							icon="chart-line"
							exact-active-class="is-active"
							tag="router-link"
							:to="{ name: 'Reports', params: { country: countryUrlParam } }"
							:class="{ 'small-menu-item': isSmallerMenuItem }"
						>
							<template #label>
								<b-tooltip :label="$t('Reports')" position="is-right" always>
									{{ $t('Reports') }}
								</b-tooltip>
							</template>
						</b-menu-item>
						<b-menu-item
							v-if="userCan.viewVouchers"
							icon="ticket-alt"
							exact-active-class="is-active"
							tag="router-link"
							:to="{ name: 'Vouchers', params: { country: countryUrlParam } }"
							:class="{ 'small-menu-item': isSmallerMenuItem }"
						>
							<template #label>
								<b-tooltip :label="$t('Vouchers')" position="is-right" always>
									{{ $t('Vouchers') }}
								</b-tooltip>
							</template>
						</b-menu-item>
						<b-menu-item
							icon="globe-africa"
							class="to-dropdown-item"
							:active="countrySettingsActive"
							:class="{ 'small-menu-item': isSmallerMenuItem }"
							@click="countrySettingsActive = !countrySettingsActive"
						>
							<template #label>
								<b-tooltip :label="$t('Country Settings')" position="is-right" always>
									{{ $t('Country Settings') }}
								</b-tooltip>
							</template>
							<b-menu-item
								v-if="userCan.viewProducts"
								class="nested-item"
								icon="shopping-cart"
								exact-active-class="is-active"
								tag="router-link"
								:to="{ name: 'Products', params: { country: countryUrlParam } }"
								:class="{ 'small-menu-item': isSmallerMenuItem }"
							>
								<template #label>
									<b-tooltip :label="$t('Products')" position="is-right" always>
										{{ $t('Products') }}
									</b-tooltip>
								</template>
							</b-menu-item>
							<b-menu-item
								v-if="userCan.countrySettings"
								class="nested-item"
								icon="map-marker-alt"
								exact-active-class="is-active"
								tag="router-link"
								:to="{
									name: 'CountrySpecificOptions',
									params: { country: countryUrlParam }
								}"
								:class="{ 'small-menu-item': isSmallerMenuItem }"
							>
								<template #label>
									<b-tooltip :label="$t('Country specifics')" position="is-right" always>
										{{ $t('Country specifics') }}
									</b-tooltip>
								</template>
							</b-menu-item>
						</b-menu-item>
						<b-menu-item
							v-if="userCan.adminSettings"
							icon="wrench"
							exact-active-class="is-active"
							tag="router-link"
							:to="{
								name: 'Administrative Settings',
								params: { country: countryUrlParam }
							}"
							:class="{ 'small-menu-item': isSmallerMenuItem }"
						>
							<template #label>
								<b-tooltip :label="$t('Administrative Settings')" position="is-right" always>
									{{ $t('Administrative Settings') }}
								</b-tooltip>
							</template>
						</b-menu-item>
						<b-menu-item
							icon="exchange-alt"
							exact-active-class="is-active"
							tag="router-link"
							:to="{
								name: 'TransactionsAssistances',
								params: { country: countryUrlParam }
							}"
							:class="{ 'small-menu-item': isSmallerMenuItem }"
						>
							<template #label>
								<b-tooltip :label="$t('Transactions')" position="is-right" always>
									Transactions
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
import permissions from "@/mixins/permissions";
import gitInfo from "@/gitInfo";

export default {
	name: "SideMenu",

	mixins: [permissions],

	data() {
		return {
			gitInfo,
			beneficiariesActive: false,
			countrySettingsActive: false,
			isSmallerMenuItem: false,
		};
	},

	computed: {
		...mapState([
			"isAsideVisible",
			"isAsideExpanded",
			"country",
		]),

		countryUrlParam() {
			return this.country.iso3.toLowerCase();
		},

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
