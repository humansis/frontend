<template>
	<div>
		<ProjectSummary />
		<AssistancesList />
	</div>
</template>

<script>
import ProjectSummary from "@/components/Projects/ProjectSummary";
import AssistancesList from "@/components/Projects/AssistancesList";

export default {
	name: "ProjectDetail",

	components: {
		AssistancesList,
		ProjectSummary,
	},
};
</script>
