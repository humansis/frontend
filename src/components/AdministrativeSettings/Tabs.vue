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
import { ADMINISTRATIVE_SETTINGS } from "@/consts";

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
				pageName: "Users",
			},
			{
				value: ADMINISTRATIVE_SETTINGS.TABS_VALUE.DONORS,
				title: "Donors",
				icon: "dollar-sign",
				isUserAllowed: this.userCan.viewDonors,
				pageName: "Donors",
			},
			{
				value: ADMINISTRATIVE_SETTINGS.TABS_VALUE.MY_ORGANIZATIONS,
				title: "My Organizations",
				icon: "child",
				pageName: "MyOrganizations",
			},
			{
				value: ADMINISTRATIVE_SETTINGS.TABS_VALUE.ORGANIZATION_SERVICES,
				title: "Organization Services",
				icon: "th-large",
				pageName: "OrganizationServices",
			},
			{
				value: ADMINISTRATIVE_SETTINGS.TABS_VALUE.SYNC,
				title: "Sync",
				icon: "th-large",
				pageName: "Sync",
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
