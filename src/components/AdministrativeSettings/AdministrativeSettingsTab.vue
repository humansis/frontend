<template>
	<div>
		<b-tabs size="is-medium">
			<b-tab-item
				label="Users"
				icon="user">
				<UsersList />
			</b-tab-item>
			<b-tab-item
				label="Donors"
				icon="dollar-sign">
				<DonorsList />
			</b-tab-item>
			<b-tab-item
				label="My Organizations"
				icon="child">
				<MyOrganizationsList />
			</b-tab-item>
			<b-tab-item
				label="Organization services"
				icon="th-large">
				<OrganizationServicesList />
			</b-tab-item>
		</b-tabs>
	</div>
</template>

<script>
import UsersList from "@/components/AdministrativeSettings/UsersList";
import DonorsList from "@/components/AdministrativeSettings/DonorsList";
import MyOrganizationsList from "@/components/AdministrativeSettings/MyOrganizationsList";
import OrganizationServicesList from "@/components/AdministrativeSettings/OrganizationServicesList";

export default {
	name: "AdministrativeSettingsTab",

	components: {
		OrganizationServicesList,
		MyOrganizationsList,
		DonorsList,
		UsersList,
	},
};
</script>
