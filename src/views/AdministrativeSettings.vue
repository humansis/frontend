<template>
	<div>
		<h1 class="title has-text-centered">{{ $t('Administrative Settings') }}</h1>

		<b-tabs v-model="selectedTab" destroy-on-hide>
			<b-tab-item icon="user" :label="$t('Users')">
				<Users />
			</b-tab-item>

			<b-tab-item v-if="userCan.viewDonors" icon="dollar-sign" :label="$t('Donors')">
				<Donors />
			</b-tab-item>

			<b-tab-item icon="child" :label="$t('My Organizations')">
				<MyOrganizations />
			</b-tab-item>

			<b-tab-item icon="th-large" :label="$t('Organization Services')">
				<OrganizationServices />
			</b-tab-item>
			<b-tab-item icon="th-large" :label="$t('Sync')">
				<Sync />
			</b-tab-item>
		</b-tabs>
	</div>
</template>

<script>
import Users from "@/views/AdministrativeSettings/Users";
import Donors from "@/views/AdministrativeSettings/Donors";
import MyOrganizations from "@/views/AdministrativeSettings/MyOrganizations";
import OrganizationServices from "@/views/AdministrativeSettings/OrganizationServices";
import Sync from "@/views/AdministrativeSettings/Sync";
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
