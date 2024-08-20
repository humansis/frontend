<template>
	<h2 class="text-center mt-4" data-cy="page-title-text">{{ $t('Administrative Settings') }}</h2>

	<v-tabs
		v-model="selectedTab"
		color="primary"
		align-tabs="start"
		class="mt-5 mb-5"
		@update:modelValue="onRedirectToTab"
	>
		<v-tab
			v-for="tab in tabs"
			:key="tab.value"
			:value="tab.value"
			class="text-none"
		>
			<v-icon :icon="tab.icon" class="mr-2" />

			{{ $t(tab.title) }}
		</v-tab>
	</v-tabs>
</template>

<script>
import permissions from "@/mixins/permissions";
import { ADMINISTRATIVE_SETTINGS, ROUTER } from "@/consts";

export default {
	mixins: [permissions],

	props: {
		preSelectedTabValue: {
			type: String,
			required: true,
		},
	},

	data() {
		return {
			selectedTab: "",
			tabs: [],
		};
	},

	mounted() {
		this.selectedTab = this.preSelectedTabValue;
		this.tabs = [
			{
				value: ADMINISTRATIVE_SETTINGS.TABS_VALUE.USERS,
				title: "Users",
				icon: "user",
				pageName: ROUTER.ROUTE_NAME.USERS.ROOT,
			},
			{
				value: ADMINISTRATIVE_SETTINGS.TABS_VALUE.DONORS,
				title: "Donors",
				icon: "dollar-sign",
				isUserAllowed: this.userCan.viewDonors,
				pageName: ROUTER.ROUTE_NAME.DONORS,
			},
			{
				value: ADMINISTRATIVE_SETTINGS.TABS_VALUE.MY_ORGANIZATIONS,
				title: "My Organizations",
				icon: "child",
				pageName: ROUTER.ROUTE_NAME.MY_ORGANIZATIONS,
			},
			{
				value: ADMINISTRATIVE_SETTINGS.TABS_VALUE.ORGANIZATION_SERVICES,
				title: "Organization Services",
				icon: "th-large",
				pageName: ROUTER.ROUTE_NAME.ORGANIZATION_SERVICES,
			},
			{
				value: ADMINISTRATIVE_SETTINGS.TABS_VALUE.SYNC,
				title: "Sync",
				icon: "th-large",
				pageName: ROUTER.ROUTE_NAME.SYNC,
			},
		];
	},

	methods: {
		onRedirectToTab(selectedTab) {
			const pageName = this.tabs.find((tab) => tab.value === selectedTab)?.pageName;

			if (pageName) {
				this.$router.push({ name: pageName });
			}
		},
	},
};
</script>
