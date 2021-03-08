<template>
	<div>
		<div class="columns">
			<div class="column">
				<NewAssistanceForm
					@updatedData="fetchNewAssistanceForm"
					@onTargetSelect="targetType = $event"
					@showComponent="onShowComponent"
					ref="assistanceForm"
				/>
			</div>
			<div class="column is-three-fifths">
				<SelectionCriteria
					v-if="visibleComponents.selectionCriteria"
					:target-type="targetType"
					@updatedData="fetchSelectionCriteria"
				/>
				<DistributedCommodity
					v-if="visibleComponents.distributedCommodity"
					@updatedData="fetchDistributedCommodity"
				/>
				<ActivityDetails
					v-if="visibleComponents.activityDescription
						|| visibleComponents.householdsTargeted
						|| visibleComponents.individualsTargeted"
					:visible="visibleActivityDetails"
					@updatedData="fetchActivityDetails"
				/>
				<TargetTypeSelect
					v-if="visibleComponents.communities || visibleComponents.institutions"
					:visible="targetTypeSelectVisible"
					@updatedData="fetchTargetType"
				/>
			</div>
		</div>
		<div class="buttons">
			<b-button type="is-danger is-light" @click="goBack">Cancel</b-button>
			<b-button type="is-success" @click="submitAddingAssistance">Create</b-button>
		</div>
	</div>
</template>

<script>
import SelectionCriteria from "@/components/AddAssistance/SelectionTypes/SelectionCriteria/SelectionCriteria";
import DistributedCommodity from "@/components/AddAssistance/SelectionTypes/DistributedCommodity/DistributedCommodity";
import NewAssistanceForm from "@/components/AddAssistance/NewAssistanceForm";
// import AssistancesService from "@/services/AssistancesService";
// import { Toast } from "@/utils/UI";
import ActivityDetails from "@/components/AddAssistance/SelectionTypes/ActivityDetails";
import TargetTypeSelect from "@/components/AddAssistance/SelectionTypes/TargetTypeSelect";

export default {
	name: "AddAssistance",

	components: {
		TargetTypeSelect,
		ActivityDetails,
		NewAssistanceForm,
		SelectionCriteria,
		DistributedCommodity,
	},

	data() {
		return {
			visibleComponents: {
				selectionCriteria: false,
				distributedCommodity: false,
				communities: false,
				institutions: false,
				activityDescription: false,
				householdsTargeted: false,
				individualsTargeted: false,
			},
			targetType: "",
			assistanceBody: {
				dateDistribution: "",
				description: "",
				householdTargeted: null,
				individualsTargeted: null,
				projectId: Number(this.$route.params.projectId),
				target: "",
				type: "",
				sector: "",
				subsector: "",
				locationId: null,
				commodities: [],
				selectionCriteria: [],
				communities: null,
				institutions: null,
				threshold: 0,
				completed: false,
				validated: false,
			},
		};
	},

	computed: {
		visibleActivityDetails() {
			return {
				activityDescription: this.visibleComponents.activityDescription,
				householdsTargeted: this.visibleComponents.householdsTargeted,
				individualsTargeted: this.visibleComponents.individualsTargeted,
			};
		},
		targetTypeSelectVisible() {
			return {
				communities: this.visibleComponents.communities,
				institutions: this.visibleComponents.institutions,
			};
		},
	},

	methods: {
		async submitAddingAssistance() {
			if (this.$refs.assistanceForm.submit()) {
				console.log("assistanceBody");
				console.log(this.assistanceBody);
			}

			/*
			await AssistancesService.createAssistance(this.assistanceBody).then(({ status }) => {
				if (status === 200) {
					Toast("Assistance Successfully Created", "is-success");
				}
			});
			*/
		},

		onShowComponent(components) {
			Object.keys(this.visibleComponents).forEach((item) => {
				this.visibleComponents[item] = components
					.find((component) => item === component);
			});
		},

		goBack() {
			this.$router.go(-1);
		},

		fetchNewAssistanceForm(data) {
			const {
				assistanceType,
				dateOfAssistance,
				locationId,
				sector,
				subsector,
				targetType,
			} = data;

			this.assistanceBody = {
				...this.assistanceBody,
				dateDistribution: dateOfAssistance.toISOString(),
				target: targetType?.code,
				type: assistanceType?.code,
				sector: sector?.code,
				subsector: subsector?.code,
				locationId,
			};
		},

		fetchSelectionCriteria(selectionCriteria, minimumSelectionScore) {
			this.assistanceBody = {
				...this.assistanceBody,
				selectionCriteria,
				threshold: minimumSelectionScore,
			};
		},

		fetchDistributedCommodity(commodities) {
			this.assistanceBody = {
				...this.assistanceBody,
				commodities,
			};
		},

		fetchActivityDetails(data) {
			const {
				activityDescription: description,
				householdsTargeted: householdTargeted,
				individualsTargeted,
			} = data;

			this.assistanceBody = {
				...this.assistanceBody,
				description,
				householdTargeted,
				individualsTargeted,
			};
		},

		fetchTargetType(data) {
			const { communities, institutions } = data;

			this.assistanceBody = {
				...this.assistanceBody,
				communities,
				institutions,
			};
		},
	},
};
</script>
