<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field
				label="Project Name"
				:type="validateType('name')"
				:message="validateMsg('name', 'Required')"
			>
				<b-input
					v-model="formModel.name"
					:disabled="formDisabled"
					@blur="validate('name')"
				/>
			</b-field>

			<b-field
				label="Internal ID"
				:type="validateType('internalId')"
				:message="validateMsg('internalId', 'Required number')"
			>
				<b-input
					v-model="formModel.internalId"
					:disabled="formDisabled"
					@blur="validate('internalId')"
				/>
			</b-field>

			<b-field
				label="Sectors"
				:type="validateType('selectedSectors')"
				:message="validateMsg('selectedSectors', 'Required')"
			>
				<MultiSelect
					v-model="formModel.selectedSectors"
					searchable
					label="code"
					track-by="value"
					multiple
					:disabled="formDisabled"
					:options="options.sectors"
					@select="validate('selectedSectors')"
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
				:type="validateType('startDate')"
				:message="validateMsg('startDate', 'Required')"
			>
				<b-datepicker
					v-model="formModel.startDate"
					show-week-number
					locale="en-GB"
					placeholder="Click to select..."
					icon="calendar-day"
					trap-focus
					:disabled="formDisabled"
					@input="validate('startDate')"
				/>
			</b-field>

			<b-field
				label="End Date"
				:type="validateType('endDate')"
				:message="validateMsg('endDate', 'Required')"
			>
				<b-datepicker
					v-model="formModel.endDate"
					show-week-number
					locale="en-GB"
					placeholder="Click to select..."
					icon="calendar-day"
					trap-focus
					:disabled="formDisabled"
					@input="validate('endDate')"
				/>
			</b-field>

			<b-field
				label="Donors"
				:type="validateType('selectedDonors')"
				:message="validateMsg('selectedDonors', 'Required')"
			>
				<MultiSelect
					v-model="formModel.selectedDonors"
					searchable
					label="shortname"
					track-by="id"
					multiple
					:disabled="formDisabled"
					:options="options.donors"
					@select="validate('selectedDonors')"
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
				:type="validateType('selectedTargetType')"
				:message="validateMsg('selectedTargetType', 'Required')"
			>
				<MultiSelect
					v-model="formModel.selectedTargetType"
					label="code"
					track-by="value"
					:options="options.targetTypes"
					:searchable="false"
					:disabled="formDisabled"
					@select="validate('selectedTargetType')"
				/>
			</b-field>

			<b-field
				label="Total Target"
				:type="validateType('totalTarget')"
				:message="validateMsg('totalTarget', 'Required, min length is 0')"
			>
				<b-numberinput
					v-model="formModel.totalTarget"
					:disabled="formDisabled"
					@blur="validate('totalTarget')"
				/>
			</b-field>

			<b-field label="Notes">
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
import { Toast } from "@/utils/UI";
import { required, minLength } from "vuelidate/lib/validators";
import Validation from "@/mixins/validation";
import SectorsService from "@/services/SectorsService";
import DonorsService from "@/services/DonorsService";
import AssistancesService from "@/services/AssistancesService";

export default {
	name: "ProjectForm",

	mixins: [Validation],

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
		formDisabled: Boolean,
	},

	data() {
		return {
			options: {
				sectors: [],
				donors: [],
				targetTypes: [],
			},
		};
	},

	validations: {
		formModel: {
			name: { required },
			internalId: { required },
			selectedSectors: { required },
			startDate: { required },
			endDate: { required },
			selectedDonors: { required },
			selectedTargetType: { required },
			totalTarget: { required, minLength: minLength(0) },
		},
	},

	mounted() {
		this.fetchSectors();
		this.fetchDonors();
		this.fetchTargetTypes();
	},

	methods: {
		submitForm() {
			// TODO change and fix selectedDonors for multiselect
			this.formModel.selectedDonors = [{ id: 2, shortName: "Donor" }];
			this.$v.$touch();
			if (this.$v.$invalid) {
				return;
			}

			this.$emit("formSubmitted", this.formModel);
			this.$v.$reset();
		},

		closeForm() {
			this.$emit("formClosed");
			this.$v.$reset();
		},

		async fetchSectors() {
			await SectorsService.getListOfSectors().then((response) => {
				this.options.sectors = response.data;
			}).catch((e) => {
				Toast(`(Sectors) ${e}`, "is-danger");
			});
		},

		async fetchDonors() {
			await DonorsService.getListOfDonors().then((response) => {
				this.options.donors = response.data;
			}).catch((e) => {
				Toast(`(Donors) ${e}`, "is-danger");
			});
		},

		async fetchTargetTypes() {
			await AssistancesService.getListOfTargetTypesForAssistances().then((response) => {
				this.options.targetTypes = response.data;
			}).catch((e) => {
				Toast(`(Target Types) ${e}`, "is-danger");
			});
		},
	},
};
</script>
