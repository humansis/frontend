<template>
	<v-container v-if="isUserPermissionGranted(PERMISSIONS.HOME_PAGE)" fluid>
		<v-row :class="{ 'flex-column': isMobile }">
			<v-col class="mb-4">
				<DistributionMap />
			</v-col>

			<v-col class="mb-4">
				<HomeSummary />
			</v-col>
		</v-row>

		<UpcomingAssistances
			v-if="isUserPermissionGranted(PERMISSIONS.PROJECT_ASSISTANCE_MANAGEMENT)"
		/>
	</v-container>
</template>

<script>
import DistributionMap from "@/components/Home/DistributionMap";
import HomeSummary from "@/components/Home/HomeSummary";
import UpcomingAssistances from "@/components/Home/UpcomingAssistances";
import permissions from "@/mixins/permissions";
import vuetifyHelper from "@/mixins/vuetifyHelper";

export default {
	name: "HomePage",

	components: {
		DistributionMap,
		HomeSummary,
		UpcomingAssistances,
	},

	mixins: [vuetifyHelper, permissions],
};
</script>
