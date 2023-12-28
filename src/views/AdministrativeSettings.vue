<template>
	<v-container fluid>
		<h2 class="text-center mt-4">{{ $t('Administrative Settings') }}</h2>

		<v-tabs
			v-model="selectedTab"
			color="primary"
			align-tabs="start"
			class="mt-5 mb-5"
		>
			<v-tab :value="0" class="text-none">
				<v-icon icon="user" class="mr-2" />

				{{ $t('Users') }}
			</v-tab>

			<v-tab v-if="userCan.viewDonors" :value="1" class="text-none">
				<v-icon icon="dollar-sign" class="mr-2" />

				{{ $t('Donors') }}
			</v-tab>

			<v-tab :value="2" class="text-none">
				<v-icon icon="child" class="mr-2" />

				{{ $t('My Organizations') }}
			</v-tab>

			<v-tab :value="3" class="text-none">
				<v-icon icon="th-large" class="mr-2" />

				{{ $t('Organization Services') }}
			</v-tab>

			<v-tab :value="4" class="text-none">
				<v-icon icon="th-large" class="mr-2" />

				{{ $t('Sync') }}
			</v-tab>
		</v-tabs>

		<v-window v-model="selectedTab">
			<v-window-item v-show="selectedTab === 0">
				<Users />
			</v-window-item>

			<v-window-item v-show="selectedTab === 1">
				<Donors />
			</v-window-item>

			<v-window-item v-show="selectedTab === 2">
				<MyOrganizations />
			</v-window-item>

			<v-window-item v-show="selectedTab === 3">
				<OrganizationServices />
			</v-window-item>

			<v-window-item v-show="selectedTab === 4">
				<Sync />
			</v-window-item>
		</v-window>
	</v-container>
</template>

<script>
import Donors from "@/components/AdministrativeSettings/Donors";
import MyOrganizations from "@/components/AdministrativeSettings/MyOrganizations";
import OrganizationServices from "@/components/AdministrativeSettings/OrganizationServices";
import Sync from "@/components/AdministrativeSettings/Sync";
import Users from "@/components/AdministrativeSettings/Users";
import permissions from "@/mixins/permissions";

export default {
	name: "AdministrativeSettings",

	components: {
		OrganizationServices,
		MyOrganizations,
		Donors,
		Users,
		Sync,
	},

	mixins: [permissions],

	data() {
		return {
			selectedTab: 0,
		};
	},
};
</script>
