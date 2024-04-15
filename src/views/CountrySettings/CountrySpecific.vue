<template>
	<v-container fluid>
		<h2 class="text-center mt-4">{{ $t('Country specifics') }}</h2>

		<v-tabs
			v-model="selectedTab"
			color="primary"
			align-tabs="start"
			class="mt-5 mb-5"
		>
			<v-tab value="customFields" class="text-none">
				<v-icon icon="user-edit" class="mr-2" />

				{{ $t('Custom Fields') }}
			</v-tab>

			<v-tab value="scoring" class="text-none">
				<v-icon icon="sort-amount-down" class="mr-2" />

				{{ $t('Scoring') }}
			</v-tab>
		</v-tabs>

		<v-window v-model="selectedTab">
			<v-window-item value="customFields">
				<CustomField />
			</v-window-item>

			<v-window-item value="scoring">
				<Scoring />
			</v-window-item>
		</v-window>
	</v-container>
</template>

<script>
import CustomField from "@/components/CountrySettings/CountrySpecific/CustomFields";
import Scoring from "@/components/CountrySettings/CountrySpecific/Scoring";
import permissions from "@/mixins/permissions";

export default {
	name: "CountrySpecificPage",

	components: {
		CustomField,
		Scoring,
	},

	mixins: [permissions],

	data() {
		return {
			selectedTab: "customFields",
		};
	},
};
</script>
