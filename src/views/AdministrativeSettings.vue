<template>
	<div>
		<b-tabs size="is-medium">
			<b-tab-item
				label="Users"
				icon="user"
			>
				<Users />
			</b-tab-item>
			<b-tab-item
				label="Donors"
				icon="dollar-sign"
			>
				<Donors />
			</b-tab-item>
			<b-tab-item
				label="My Organizations"
				icon="child"
			>
				<MyOrganizations />
			</b-tab-item>
			<b-tab-item
				label="Organization services"
				icon="th-large"
			>
				<OrganizationServices />
			</b-tab-item>
			<b-tab-item
				label="Countries"
				icon="globe-europe"
			>
				<Countries />
			</b-tab-item>
			<b-tab-item
				label="Languages"
				icon="language"
			>
				<Languages />
			</b-tab-item>
			<b-tab-item
				label="Currencies"
				icon="dollar-sign"
			>
				<Currencies />
			</b-tab-item>
			<b-tab-item
				label="Translations"
				icon="translation"
			>
				<Translations />
			</b-tab-item>
		</b-tabs>
	</div>
</template>

<script>
import Users from "@/views/AdministrativeSettings/Users";
import Donors from "@/views/AdministrativeSettings/Donors";
import MyOrganizations from "@/views/AdministrativeSettings/MyOrganizations";
import OrganizationServices from "@/views/AdministrativeSettings/OrganizationServices";
import Countries from "@/views/AdministrativeSettings/Countries";
import Languages from "@/views/AdministrativeSettings/Languages";
import Currencies from "@/views/AdministrativeSettings/Currencies";
import Translations from "@/views/AdministrativeSettings/Translations";

export default {
	name: "AdministrativeSettings",

	components: {
		Translations,
		Currencies,
		Countries,
		Languages,
		OrganizationServices,
		MyOrganizations,
		Donors,
		Users,
	},
};
</script>
