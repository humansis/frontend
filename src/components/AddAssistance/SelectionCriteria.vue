<template>
	<div class="mb-5">
		<h2 class="title space-between mb-0">
			Selection Criteria
			<b-button
				class="mb-5"
				type="is-success"
				icon-left="plus"
				@click="addCriteria(undefined)"
			>
				Add Group
			</b-button>
		</h2>
		<Modal
			can-cancel
			header="Create A New Criteria"
			:active.sync="criteriaModal.isOpened"
			@close="closeCriteriaModal"
		>
			<SelectionCriteriaForm
				close-button
				ref="criteriaForm"
				submit-button-label="Create"
				:formModel="criteriaModel"
				@formSubmitted="submitCriteriaForm"
				@formClosed="closeCriteriaModal"
			/>
		</Modal>

		<div class="mb-2" ref="selectionGroupPanel">
			<SelectionCriteriaGroup
				v-for="(group, key) in groups"
				:data="group.data"
				:key="key"
				:group-id="key"
				:groupName="'Group ' + key"
				@addCriteria="addCriteria"
				@removeGroup="removeGroup"
			/>

			<b-notification
				v-if="groups.length === 0"
				type="is-light"
			>
				No data
			</b-notification>
		</div>
		<b-field label="Minimum Selection Score">
			<b-numberinput :value="0" />
		</b-field>
		<p>
			The system will only select beneficiaries/households that have a score higher
			than the minimum selection score
		</p>
	</div>
</template>

<script>
import Modal from "@/components/Modal";
import SelectionCriteriaForm from "@/components/AddAssistance/SelectionCriteriaForm";
import SelectionCriteriaGroup from "@/components/AddAssistance/SelectionCriteriaGroup";

export default {
	name: "SelectionCriteria",

	components: {
		SelectionCriteriaGroup,
		Modal,
		SelectionCriteriaForm,
	},

	data() {
		return {
			criteriaModal: {
				isOpened: false,
			},
			criteriaModel: {
				criteriaTarget: null,
				criteria: null,
				condition: null,
				value: null,
				scoreWeight: 1,
			},
			groups: [],
			maxGroupId: 0,
		};
	},

	updated() {
		// TODO Emit only if table data length > 0
		this.$emit("updatedData", this.groups);
	},

	methods: {
		addCriteria(id) {
			console.log(id);
			this.criteriaModal.isOpened = true;

			this.criteriaModel = {
				criteriaTarget: null,
				criteria: null,
				condition: null,
				value: null,
				scoreWeight: 1,
				groupId: id,
			};
		},

		closeCriteriaModal() {
			this.criteriaModal.isOpened = false;
		},

		submitCriteriaForm(criteriaForm) {
			if (criteriaForm.groupId !== undefined) {
				this.groups[criteriaForm.groupId].data.push(criteriaForm);
			} else {
				const index = this.groups.push({ data: [] }) - 1;
				this.groups[index].data.push(criteriaForm);
			}
			this.criteriaModal.isOpened = false;
		},

		removeGroup(groupId) {
			// TODO I'm working on delete group, but if I delete top group, then deletes with lowest index
			console.log(groupId);
			// console.log(this.groups);
			// const selectedGroup = this.groups.find((item, key) => key === groupId);
			// console.log(selectedGroup);
			// const index = selectedGroup.indexOf();
			// console.log(index);
			// this.groups = this.groups.filter((value, key) => key !== groupId);
			this.groups = this.groups.splice(groupId, 1);
			// const preparedGroups = this.groups.filter((value, key) => key !== groupId);
			// this.groups = preparedGroups;
		},
	},
};
</script>
