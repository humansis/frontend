<template>
	<div>
		<b-tabs size="is-medium">
			<b-tab-item
				label="Users"
				icon="users">
				<UsersList />
			</b-tab-item>
			<b-tab-item
				label="Donors"
				icon="donors">
				<DonorsList />
			</b-tab-item>
			<b-tab-item
				label="My Organizations"
				icon="my-organizations">
				<MyOrganizationsList />
			</b-tab-item>
			<b-tab-item
				label="Organization services"
				icon="organization-services">
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
