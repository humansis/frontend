<template>
	<div>
		<h1 class="title has-text-centered">{{ $t('Administrative Settings') }}</h1>

		<b-tabs v-model="selectedTab">
			<b-tab-item icon="user" :label="$t('Users')">
				<Users />
			</b-tab-item>

			<b-tab-item icon="dollar-sign" :label="$t('Donors')">
				<Donors />
			</b-tab-item>

			<b-tab-item icon="child" :label="$t('My Organizations')">
				<MyOrganizations />
			</b-tab-item>

			<b-tab-item icon="th-large" :label="$t('Organization Services')">
				<OrganizationServices />
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
import Users from "@/views/AdministrativeSettings/Users";
import Donors from "@/views/AdministrativeSettings/Donors";
import MyOrganizations from "@/views/AdministrativeSettings/MyOrganizations";
import OrganizationServices from "@/views/AdministrativeSettings/OrganizationServices";
/*
import Countries from "@/views/AdministrativeSettings/Countries";
import Languages from "@/views/AdministrativeSettings/Languages";
import CurrenciesList from "@/views/AdministrativeSettings/CurrenciesList";
import TranslationsList from "@/views/AdministrativeSettings/TranslationsList";
*/

export default {
	name: "AdministrativeSettings",

	components: {
		/*
		TranslationsList,
		CurrenciesList,
		Countries,
		Languages,
		*/
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
