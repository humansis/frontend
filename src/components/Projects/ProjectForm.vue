<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field
				label="Project Name"
				:type="getValidationType('name')"
				:message="getValidationMessage('name', 'Required')"
			>
				<b-input
					v-model="formModel.name"
					:disabled="formDisabled"
					@blur="validateInput('name')"
				/>
			</b-field>

			<b-field
				label="Internal ID"
				:type="getValidationType('internalId')"
				:message="getValidationMessage('internalId', 'Required number')"
			>
				<b-input
					v-model="formModel.internalId"
					:disabled="formDisabled"
					@blur="validateInput('internalId')"
				/>
			</b-field>

			<b-field
				label="Sectors"
				:type="getValidationType('selectedSectors')"
				:message="getValidationMessage('selectedSectors', 'Required')"
			>
				<MultiSelect
					v-model="formModel.selectedSectors"
					searchable
					placeholder="Select sectors"
					label="code"
					track-by="value"
					multiple
					:disabled="formDisabled"
					:options="formModel.sectors"
					@select="validateInput('selectedSectors')"
				>
					<template
						slot="singleLabel"
						slot-scope="option"
					>
						{{ option.code }}
					</template>
				</MultiSelect>
			</b-field>

			<b-field
				label="Start date"
				:type="getValidationType('startDate')"
				:message="getValidationMessage('startDate', 'Required')"
			>
				<b-datepicker
					v-model="formModel.startDate"
					show-week-number
					locale="en-GB"
					placeholder="Click to select..."
					icon="calendar-day"
					trap-focus
					:disabled="formDisabled"
					@input="validateInput('startDate')"
				/>
			</b-field>

			<b-field
				label="Start end"
				:type="getValidationType('endDate')"
				:message="getValidationMessage('endDate', 'Required')"
			>
				<b-datepicker
					v-model="formModel.endDate"
					show-week-number
					locale="en-US"
					placeholder="Click to select..."
					icon="calendar-day"
					trap-focus
					:disabled="formDisabled"
					@input="validateInput('endDate')"
				/>
			</b-field>

			<b-field
				label="Donors"
				:type="getValidationType('selectedDonors')"
				:message="getValidationMessage('selectedDonors', 'Required')"
			>
				<MultiSelect
					v-model="formModel.selectedDonors"
					searchable
					placeholder="Select donors"
					label="shortname"
					track-by="id"
					multiple
					:disabled="formDisabled"
					:options="formModel.donors"
					@select="validateInput('selectedDonors')"
				>
					<template
						slot="singleLabel"
						slot-scope="option"
					>
						{{ option.shortname }}
					</template>
				</MultiSelect>
			</b-field>

			<b-field
				label="Target Type"
				:type="getValidationType('selectedTargetType')"
				:message="getValidationMessage('selectedTargetType', 'Required')"
			>
				<MultiSelect
					v-model="formModel.selectedTargetType"
					label="code"
					track-by="value"
					placeholder="Select target type"
					:options="formModel.targetTypes"
					:searchable="false"
					:disabled="formDisabled"
					@select="validateInput('selectedTargetType')"
				/>
			</b-field>

			<b-field
				label="Total Target"
				:type="getValidationType('totalTarget')"
				:message="getValidationMessage('totalTarget', 'Required, min length is 0')"
			>
				<b-numberinput
					v-model="formModel.totalTarget"
					:disabled="formDisabled"
					@blur="validateInput('totalTarget')"
				/>
			</b-field>

			<b-field
				label="Notes"
			>
				<b-input
					v-model="formModel.notes"
					type="textarea"
					:disabled="formDisabled"
				/>
			</b-field>

		</section>

		<footer class="modal-card-foot">
			<button v-if="closeButton" class="button" type="button" @click="closeForm">
				Close
			</button>
			<b-button
				v-if="!formDisabled"
				tag="input"
				class="is-success"
				native-type="submit"
				:value="submitButtonLabel"
			/>
		</footer>
	</form>
</template>

<script>
import { required, minLength, numeric } from "vuelidate/lib/validators";

export default {
	name: "ProjectForm",

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
		formDisabled: Boolean,
	},

	validations: {
		formModel: {
			name: {
				required,
			},
			internalId: {
				required,
				numeric,
			},
			selectedSectors: {
				required,
			},
			startDate: {
				required,
			},
			endDate: {
				required,
			},
			selectedDonors: {
				required,
			},
			selectedTargetType: {
				required,
			},
			totalTarget: {
				required,
				minLength: minLength(0),
			},
		},
	},

	methods: {
		submitForm() {
			this.$v.$touch();
			if (this.$v.$invalid) {
				return;
			}

			this.$emit("formSubmitted", this.formModel);
			this.$v.$reset();
		},

		validateInput(fieldName) {
			this.$v.formModel[fieldName].$touch();
		},

		getValidationMessage(fieldName, message) {
			return this.$v.formModel[fieldName].$error ? message : "";
		},

		getValidationType(fieldName) {
			let result = "";
			if (this.$v.formModel[fieldName].$dirty) {
				result = this.$v.formModel[fieldName].$error ? "is-danger" : "is-success";
			}
			return result;
		},

		closeForm() {
			this.$emit("formClosed");
			this.$v.$reset();
		},
	},
};
</script>
