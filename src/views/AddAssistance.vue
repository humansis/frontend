<template>
	<div>
		<div class="columns">
			<div class="column">
				<NewAssistanceForm
					@updatedData="fetchNewAssistanceForm"
					@onTargetSelect="targetType = $event"
					@showComponent="onShowComponent"
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
				<TargetTypeSelect
					v-if="visibleComponents.communities || visibleComponents.institutions"
				/>
				<ActivityDetails
					v-if="visibleComponents.activityDescription
						|| visibleComponents.householdsTargeted
						|| visibleComponents.individualsTargeted"
					:form-model="activityDetails"
					:visible="visibleActivityDetails"
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
import AssistancesService from "@/services/AssistancesService";
import { Toast } from "@/utils/UI";
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
			newAssistanceForm: null,
			selectionCriteria: null,
			distributedCommodity: null,
			activityDetails: {
				activityDescription: "",
				householdsTargeted: 0,
				individualsTargeted: 0,
			},
			visibleComponents: {
				selectionCriteria: false,
				distributedCommodity: false,
				communities: false,
				institutions: false,
				activityDescription: false,
				householdsTargeted: false,
				individualsTargeted: false,
			},
			assistanceBody: {
				adm1: null,
				adm2: null,
				adm3: null,
				adm4: null,
				dateOfAssistance: null,
				target: null,
				minimumSelectionScore: 0,
				groups: [],
				distributedCommodity: [],
			},
			targetType: "",
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
	},

	methods: {
		async submitAddingAssistance() {
			if (this.$refs.assistanceForm.submit()) {
				return;
			}
			await AssistancesService.createAssistance(this.assistanceBody).then(({ status }) => {
				if (status === 200) {
					Toast("Assistance Successfully Created", "is-success");
				}
			});
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

		fetchNewAssistanceForm(formModel) {
			if (formModel) {
				this.assistanceBody = {
					...this.assistanceBody,
					adm1: formModel.adm1,
					adm2: formModel.adm2,
					adm3: formModel.adm3,
					adm4: formModel.adm4,
					dateOfAssistance: formModel.dateOfAssistance.toISOString(),
					target: formModel.target,
				};
			}
		},

		fetchSelectionCriteria(data, minimumSelectionScore) {
			if (data) {
				this.assistanceBody = {
					...this.assistanceBody,
					minimumSelectionScore,
					groups: data,
				};
			}
		},

		fetchDistributedCommodity(data) {
			if (data) {
				this.assistanceBody = {
					...this.assistanceBody,
					distributedCommodity: data,
				};
			}
		},
	},
};
</script>
