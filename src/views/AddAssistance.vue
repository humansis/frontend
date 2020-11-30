<template>
	<div>
		<div class="columns">
			<div class="column">
				<NewAssistanceForm @updatedData="fetchNewAssistanceForm" />
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

		fetchDistributedCommodity(data) {
			if (data) {
				this.distributedCommodity = data;
			}
		},
	},
};
</script>
