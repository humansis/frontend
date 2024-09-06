<template>
	<v-container fluid>
		<h2 class="text-center mt-4" data-cy="page-title-text">{{ $t('Country specifics') }}</h2>

		<v-tabs
			v-model="selectedTab"
			color="primary"
			align-tabs="start"
			class="mt-5 mb-5"
		>
			<v-tab
				:disabled="!isUserPermissionGranted(PERMISSIONS.COUNTRY_SETTINGS_CUSTOM_FIELD)"
				:data-cy="identifierBuilder('custom-fields-tab-button')"
				value="customFields"
				class="text-none"
			>
				<v-icon icon="user-edit" class="mr-2" />

				{{ $t('Custom Fields') }}
			</v-tab>

			<v-tab
				:disabled="!isUserPermissionGranted(PERMISSIONS.COUNTRY_SETTINGS_SCORING)"
				:data-cy="identifierBuilder('scoring-tab-button')"
				value="scoring"
				class="text-none"
			>
				<v-icon icon="sort-amount-down" class="mr-2" />

				{{ $t('Scoring') }}
			</v-tab>
		</v-tabs>

		<v-window v-model="selectedTab">
			<v-window-item value="customFields">
				<CustomField v-if="isUserPermissionGranted(PERMISSIONS.COUNTRY_SETTINGS_CUSTOM_FIELD)" />
			</v-window-item>

			<v-window-item value="scoring">
				<Scoring v-if="isUserPermissionGranted(PERMISSIONS.COUNTRY_SETTINGS_SCORING)" />
			</v-window-item>
		</v-window>
	</v-container>
</template>

<script>
import CustomField from "@/components/CountrySettings/CountrySpecific/CustomFields";
import Scoring from "@/components/CountrySettings/CountrySpecific/Scoring";
import identifierBuilder from "@/mixins/identifierBuilder";
import permissions from "@/mixins/permissions";

export default {
	name: "CountrySpecificPage",

	components: {
		CustomField,
		Scoring,
	},

	mixins: [permissions, identifierBuilder],

	data() {
		return {
			selectedTab: "customFields",
		};
	},
};
</script>
