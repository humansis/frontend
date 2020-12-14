<template>
	<div>
		<b-tabs v-model="selectedTab" size="is-medium">
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
import Users from "@/views/AdministrativeSettings/UsersPage";
import Donors from "@/views/AdministrativeSettings/DonorsPage";
import MyOrganizations from "@/views/AdministrativeSettings/MyOrganizationsPage";
import OrganizationServices from "@/views/AdministrativeSettings/OrganizationServicesPage";
import Countries from "@/views/AdministrativeSettings/CountriesPage";
import Languages from "@/views/AdministrativeSettings/LanguagesPage";
import Currencies from "@/views/AdministrativeSettings/CurrenciesList";
import Translations from "@/views/AdministrativeSettings/TranslationsList";

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

	data() {
		return {
			selectedTab: 0,
		};
	},
};
</script>
