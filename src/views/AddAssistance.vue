<template>
	<div>
		<div class="columns">
			<div class="column">
				<NewAssistanceForm ref="assistanceForm" @updatedData="fetchNewAssistanceForm" />
			</div>
			<div class="column is-three-fifths">
				<SelectionCriteria
					:target-type="targetType"
					@updatedData="fetchSelectionCriteria"
				/>
				<DistributedCommodity @updatedData="fetchDistributedCommodity" />
			</div>
		</div>
		<div class="buttons">
			<b-button type="is-danger is-light">Cancel</b-button>
			<b-button @click="submitAddingAssistance" type="is-success">Create</b-button>
		</div>
	</div>
</template>

<script>
import { Toast } from "@/utils/UI";
import NewAssistanceForm from "@/components/AddAssistance/NewAssistanceForm";
import SelectionCriteria from "@/components/AddAssistance/SelectionCriteria";
import DistributedCommodity from "@/components/AddAssistance/DistributedCommodity";
import AssistancesService from "@/services/AssistancesService";

export default {
	name: "AddAssistance",

	components: {
		NewAssistanceForm,
		SelectionCriteria,
		DistributedCommodity,
	},

	computed: {
		targetType() {
			if (this.newAssistanceForm === null) {
				return "";
			}
			return this.newAssistanceForm.target;
		},
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

		fetchNewAssistanceForm(formModel) {
			if (formModel) {
				this.assistanceBody = {
					...this.assistanceBody,
					adm1: formModel.adm1,
					adm2: formModel.adm2,
					adm3: formModel.adm3,
					adm4: formModel.adm4,
					dateOfAssistance: formModel.dateOfAssistance,
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
