<template>
	<div>
		<h1 class="title has-text-centered">{{ $t('Administrative Settings') }}</h1>

		<b-tabs v-model="selectedTab">
			<b-tab-item icon="user" :label="$t('Users')">
				<UsersPage />
			</b-tab-item>

			<b-tab-item icon="dollar-sign" :label="$t('Donors')">
				<DonorPage />
			</b-tab-item>

			<b-tab-item icon="child" :label="$t('My Organizations')">
				<MyOrganizationsPage />
			</b-tab-item>

			<b-tab-item icon="th-large" :label="$t('Organization services')">
				<OrganizationServicePage />
			</b-tab-item>
			<!---
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
				icon="people-arrows"
			>
				<TranslationsList />
			</b-tab-item>
			--->
		</b-tabs>
	</div>
</template>

<script>
import UsersPage from "@/views/AdministrativeSettings/Users";
import DonorPage from "@/views/AdministrativeSettings/Donors";
import MyOrganizationsPage from "@/views/AdministrativeSettings/MyOrganizations";
import OrganizationServicePage from "@/views/AdministrativeSettings/OrganizationServices";
/*
import CountriesPage from "@/views/AdministrativeSettings/CountriesPage";
import LanguagesPage from "@/views/AdministrativeSettings/LanguagesPage";
import CurrenciesList from "@/views/AdministrativeSettings/CurrenciesList";
import TranslationsList from "@/views/AdministrativeSettings/TranslationsList";
*/

export default {
	name: "AdministrativeSettings",

	components: {
		/*
		TranslationsList,
		CurrenciesList,
		CountriesPage,
		LanguagesPage,
		*/
		OrganizationServicePage,
		MyOrganizationsPage,
		DonorPage,
		UsersPage,
	},

	data() {
		return {
			selectedTab: 0,
		};
	},
};
</script>
