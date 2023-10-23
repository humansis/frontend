<template>
	<div>
		<AssistancesList
			upcoming
		/>
	</div>
</template>

<script>
import AssistancesList from "@/components/Projects/AssistancesList";

export default {
	name: "UpcomingAssistances",

	components: {
		AssistancesList,
	},
};
</script>
