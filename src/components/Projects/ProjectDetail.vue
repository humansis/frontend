<template>
	<div>
		<GoBackButton />
		<ProjectSummary />
		<AssistancesList />
	</div>
</template>

<script>
import ProjectSummary from "@/components/Projects/ProjectSummary";
import GoBackButton from "@/components/GoBackButton";
import AssistancesList from "@/components/Projects/AssistancesList";

export default {
	name: "ProjectDetail",

	components: {
		AssistancesList,
		ProjectSummary,
		GoBackButton,
	},
};
</script>
