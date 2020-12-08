<template>
	<div class="modal-card-body">
		<form>
			<b-field label="Name">
				<b-input v-model="formModel.name" disabled />
			</b-field>

			<LocationForm
				v-if="!editing"
				ref="locationForm"
				:form-disabled="true"
				:form-model="formModel"
			/>
			<b-field label="Date of Assistance">
				<b-datepicker
					v-model="formModel.dateOfAssistance"
					show-week-number
					locale="en-GB"
					placeholder="Click to select..."
					icon="calendar-day"
					trap-focus
					:disabled="!editing"
				/>
			</b-field>

			<b-field label="target">
				<b-input v-model="formModel.target" disabled />
			</b-field>

			<footer class="modal-card-foot">
				<button class="button" type="button" @click="closeForm">
					Close
				</button>
				<b-button
					v-if="editing"
					value="Update"
					tag="input"
					class="is-success"
					@click="submitForm"
				/>
			</footer>
		</form>
	</div>
</template>

<script>
import LocationForm from "@/components/LocationForm";

export default {
	name: "AssistanceForm",

	components: {
		LocationForm,
	},

	props: {
		formModel: Object,
		editing: Boolean,
	},

	methods: {
		submitForm() {
			this.$emit("formSubmitted", this.formModel);
			this.closeForm();
		},

		closeForm() {
			this.$emit("formClosed");
		},
	},
};
</script>
