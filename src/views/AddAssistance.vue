<template>
	<div>
		<div class="columns">
			<div class="column">
				<NewAssistanceForm
					@updatedData="fetchNewAssistanceForm"
					@onTargetSelect="targetType = $event"
				/>
			</div>
			<div class="column is-three-fifths">
				<SelectionCriteriaPage
					:target-type="targetType"
					@updatedData="fetchSelectionCriteria"
				/>
				<DistributedCommodity @updatedData="fetchDistributedCommodity" />
			</div>
		</div>
		<div class="buttons">
			<b-button type="is-danger is-light" @click="goBack">Cancel</b-button>
			<b-button type="is-success" @click="submitAddingAssistance">Create</b-button>
		</div>
	</div>
</template>

<script>
import { Toast } from "@/utils/UI";
import NewAssistanceForm from "@/components/AddAssistance/NewAssistanceForm";
import SelectionCriteriaPage from "@/components/AddAssistance/SelectionCriteriaPage";
import DistributedCommodity from "@/components/AddAssistance/DistributedCommodity";
import AssistancesService from "@/services/AssistancesService";

export default {
	name: "AddAssistance",

	components: {
		NewAssistanceForm,
		SelectionCriteriaPage,
		DistributedCommodity,
	},

	data() {
		return {
			newAssistanceForm: null,
			selectionCriteria: null,
			distributedCommodity: null,
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
