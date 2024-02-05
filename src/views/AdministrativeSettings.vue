<template>
	<v-container fluid>
		<h2 class="text-center mt-4">{{ $t('Administrative Settings') }}</h2>

		<v-tabs
			v-model="selectedTab"
			color="primary"
			align-tabs="start"
			class="mt-5 mb-5"
		>
			<v-tab value="users" class="text-none">
				<v-icon icon="user" class="mr-2" />

				{{ $t('Users') }}
			</v-tab>

			<v-tab v-if="userCan.viewDonors" value="donors" class="text-none">
				<v-icon icon="dollar-sign" class="mr-2" />

				{{ $t('Donors') }}
			</v-tab>

			<v-tab value="myOrganizations" class="text-none">
				<v-icon icon="child" class="mr-2" />

				{{ $t('My Organizations') }}
			</v-tab>

			<v-tab value="organizationServices" class="text-none">
				<v-icon icon="th-large" class="mr-2" />

				{{ $t('Organization Services') }}
			</v-tab>

			<v-tab value="sync" class="text-none">
				<v-icon icon="th-large" class="mr-2" />

				{{ $t('Sync') }}
			</v-tab>
		</v-tabs>

		<v-window v-model="selectedTab">
			<v-window-item value="users">
				<Users />
			</v-window-item>

			<v-window-item value="donors">
				<Donors />
			</v-window-item>

			<v-window-item value="myOrganizations">
				<MyOrganizations />
			</v-window-item>

			<v-window-item value="organizationServices">
				<OrganizationServices />
			</v-window-item>

			<v-window-item value="sync">
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
			selectedTab: "users",
		};
	},
};
</script>
