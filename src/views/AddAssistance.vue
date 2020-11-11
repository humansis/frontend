<template>
	<div>
		<div class="columns">
			<div class="column">
				<NewAssistanceForm @updatedData="fetchNewAssistanceForm" />
			</div>
			<div class="column is-three-fifths">
				<SelectionCriteria @updatedData="fetchSelectionCriteria" />
				<DistributedCommodity />
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
import NewAssistanceForm from "@/components/AddAsistance/NewAssistanceForm";
import SelectionCriteria from "@/components/AddAsistance/SelectionCriteria";
import DistributedCommodity from "@/components/AddAsistance/DistributedCommodity";

export default {
	name: "AddAssistance",

	components: {
		NewAssistanceForm,
		SelectionCriteria,
		DistributedCommodity,
	},

	data() {
		return {
			newAssistanceForm: null,
			selectionCriteria: null,
		};
	},

	methods: {
		submitAddingAssistance() {
			Toast("Assistance Successfully Created", "is-success");
		},

		fetchNewAssistanceForm(formModel) {
			if (formModel) {
				this.newAssistanceForm = formModel;
			}
		},

		fetchSelectionCriteria(data) {
			if (data) {
				this.selectionCriteria = data;
			}
		},
	},
};
</script>
