<template>
	<div>
		<div class="columns">
			<div class="column">
				<NewAssistanceForm
					ref="newAssistanceForm"
					@updatedData="fetchNewAssistanceForm"
					@onTargetSelect="targetType = $event"
					@showComponent="onShowComponent"
				/>
			</div>
			<div class="column is-three-fifths">
				<SelectionCriteria
					ref="selectionCriteria"
					v-if="visibleComponents.selectionCriteria"
					:target-type="targetType"
					@updatedData="fetchSelectionCriteria"
				/>
				<DistributedCommodity
					ref="distributedCommodity"
					v-if="visibleComponents.distributedCommodity"
					@updatedData="fetchDistributedCommodity"
				/>
				<ActivityDetails
					ref="activityDetails"
					v-if="visibleComponents.activityDescription
						|| visibleComponents.householdsTargeted
						|| visibleComponents.individualsTargeted"
					:visible="visibleActivityDetails"
					@updatedData="fetchActivityDetails"
				/>
				<TargetTypeSelect
					ref="targetTypeSelect"
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
import AssistancesService from "@/services/AssistancesService";
import { Notification, Toast } from "@/utils/UI";
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
				communities: [],
				institutions: [],
				threshold: 0,
				completed: false,
				validated: false,
				countryIso3: this.$store.state.country?.iso3,
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
			if (!this.$refs.newAssistanceForm.submit()) return;

			if (this.visibleComponents.communities || this.visibleComponents.institutions) {
				if (!this.$refs.targetTypeSelect.submit()) return;
			}

			if (this.visibleComponents.activityDescription
				|| this.visibleComponents.householdsTargeted
				|| this.visibleComponents.individualsTargeted
			) {
				if (!this.$refs.activityDetails.submit()) return;
			}

			if (this.visibleComponents.distributedCommodity) {
				if (!this.$refs.distributedCommodity.submit()) return;
			}

			if (this.visibleComponents.selectionCriteria) {
				if (!this.$refs.selectionCriteria.submit()) return;
			}

			console.log("assistanceBody");
			console.log(this.assistanceBody);

			await AssistancesService.createAssistance(this.assistanceBody).then(({ status }) => {
				if (status === 200) {
					Toast("Assistance Successfully Created", "is-success");
				}
			}).catch((e) => {
				Notification(`New Assistance ${e}`, "is-danger");
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
