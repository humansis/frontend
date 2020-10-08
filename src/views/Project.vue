<template>
	<div>
        <GoBackButton />
        <ProjectSummary />
        <Assistances />
	</div>
</template>

<script>
import Assistances from "@/components/Projects/Assistances";
import ProjectSummary from "@/components/Projects/ProjectSummary";
import GoBackButton from "@/components/GoBackButton";

export default {
	name: "Project",

	components: {
		Assistances,
		ProjectSummary,
		GoBackButton,
	},
};
</script>
