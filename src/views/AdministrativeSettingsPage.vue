<template>
	<div>
		<b-tabs v-model="selectedTab" size="is-medium">
			<b-tab-item
				label="Users"
				icon="user"
			>
				<UsersPage />
			</b-tab-item>
			<b-tab-item
				label="Donors"
				icon="dollar-sign"
			>
				<DonorsPage />
			</b-tab-item>
			<b-tab-item
				label="My Organizations"
				icon="child"
			>
				<MyOrganizationsPage />
			</b-tab-item>
			<b-tab-item
				label="Organization services"
				icon="th-large"
			>
				<OrganizationServicesPage />
			</b-tab-item>
			<b-tab-item
				label="Countries"
				icon="globe-europe"
			>
				<CountriesPage />
			</b-tab-item>
			<b-tab-item
				label="Languages"
				icon="language"
			>
				<LanguagesPage />
			</b-tab-item>
			<b-tab-item
				label="Currencies"
				icon="dollar-sign"
			>
				<CurrenciesList />
			</b-tab-item>
			<b-tab-item
				label="Translations"
				icon="translation"
			>
				<TranslationsList />
			</b-tab-item>
		</b-tabs>
	</div>
</template>

<script>
import UsersPage from "@/views/AdministrativeSettings/UsersPage";
import DonorsPage from "@/views/AdministrativeSettings/DonorsPage";
import MyOrganizationsPage from "@/views/AdministrativeSettings/MyOrganizationsPage";
import OrganizationServicesPage from "@/views/AdministrativeSettings/OrganizationServicesPage";
import CountriesPage from "@/views/AdministrativeSettings/CountriesPage";
import LanguagesPage from "@/views/AdministrativeSettings/LanguagesPage";
import CurrenciesList from "@/views/AdministrativeSettings/CurrenciesList";
import TranslationsList from "@/views/AdministrativeSettings/TranslationsList";

export default {
	name: "AdministrativeSettings",

	components: {
		TranslationsList,
		CurrenciesList,
		CountriesPage,
		LanguagesPage,
		OrganizationServicesPage,
		MyOrganizationsPage,
		DonorsPage,
		UsersPage,
	},

	data() {
		return {
			selectedTab: 0,
		};
	},
};
</script>
