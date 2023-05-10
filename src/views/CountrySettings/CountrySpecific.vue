<template>
	<div>
		<h1 class="title has-text-centered">{{ $t('Country specifics') }}</h1>

		<b-tabs v-model="selectedTab">
			<b-tab-item icon="user-edit" :label="$t('Custom fields')">
				<CountrySpecificOption />
			</b-tab-item>

			<b-tab-item v-if="userCan.viewScoring" icon="sort-amount-down" :label="$t('Scoring')">
				<Scoring />
			</b-tab-item>
		</b-tabs>
	</div>
</template>

<script>
import CountrySpecificOption from "@/components/CountrySettings/CountrySpecific/CustomFields/CustomFields";
import Scoring from "@/components/CountrySettings/CountrySpecific/Scoring/Scoring";
import permissions from "@/mixins/permissions";

export default {
	name: "CountrySpecificOptionPage",

	components: {
		CountrySpecificOption,
		Scoring,
	},

	mixins: [permissions],

	data() {
		return {
			selectedTab: 0,
		};
	},
};
</script>
