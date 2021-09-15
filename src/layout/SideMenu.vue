<template>
	<aside
		v-show="isAsideVisible"
		class="aside is-placed-left"
		:class="{'is-expanded': isAsideExpanded}"
	>
		<div ref="container" class="aside-container">
			<div class="image">
				<router-link to="/">
					<img src="@/assets/images/bms_logo.png" alt="" class="bms-logo">
				</router-link>
			</div>
			<div class="git-info">
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
							:to="{ name: 'Home' }"
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
							:to="{ name: 'Projects' }"
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
								:to="{ name: 'Households' }"
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
								:to="{ name: 'Institutions' }"
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
								:to="{ name: 'Communities' }"
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
								:to="{ name: 'Vendors' }"
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
							:to="{ name: 'Imports' }"
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
							:to="{ name: 'Reports' }"
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
							:to="{ name: 'Vouchers' }"
						>
							<template #label>
								<b-tooltip :label="$t('Vouchers')" position="is-right" always>
									{{ $t('Vouchers') }}
								</b-tooltip>
							</template>
						</b-menu-item>
						<b-menu-item
							icon="cog"
							class="to-dropdown-item"
							:active="configurationActive"
							@click="configurationActive = !configurationActive"
						>
							<template #label>
								<b-tooltip :label="$t('Configuration')" position="is-right" always>
									{{ $t('Configuration') }}
								</b-tooltip>
							</template>
							<b-menu-item
								v-if="userCan.viewProducts"
								class="nested-item"
								icon="shopping-cart"
								exact-active-class="is-active"
								tag="router-link"
								:to="{ name: 'Products' }"
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
								:to="{ name: 'CountrySpecificOptions' }"
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
							:to="{ name: 'Administrative Settings' }"
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
							:to="{ name: 'Transactions', query: { tab: 'distributions' } }"
						>
							<template #label>
								<b-tooltip label="Transactions" position="is-right" always>
									Transactions
								</b-tooltip>
							</template>
						</b-menu-item>
						<!--
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
						-->
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
			configurationActive: false,
		};
	},

	computed: {
		...mapState([
			"isAsideVisible",
			"isAsideExpanded",
		]),

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
	},

	created() {
		if (this.isAsideExpanded) {
			this.$store.commit("asideStateToggle");
		}
	},

	methods: {
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

<style scoped>
.git-info {
	position: absolute;
	bottom: 20px;
	padding: 4px;
	color: #ffffff;
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 100%;
}
</style>
