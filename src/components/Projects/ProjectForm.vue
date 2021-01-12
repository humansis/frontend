<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field
				label="Project Name"
				:type="validateType('name')"
				:message="validateMsg('name')"
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
				:message="validateMsg('selectedSectors')"
			>
				<MultiSelect
					v-model="formModel.selectedSectors"
					searchable
					label="code"
					track-by="value"
					multiple
					placeholder="Click to select..."
					:disabled="formDisabled"
					:options="options.sectors"
					:loading="sectorsLoading"
					:class="validateMultiselect('selectedSectors')"
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
				:message="validateMsg('startDate')"
			>
				<b-datepicker
					v-model="formModel.startDate"
					show-week-number
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
				:message="validateMsg(
					'endDate',
					`Required and must be greater than Start Date`
				)"
			>
				<b-datepicker
					v-model="formModel.endDate"
					show-week-number
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
				:message="validateMsg('selectedDonors')"
			>
				<MultiSelect
					v-model="formModel.selectedDonors"
					searchable
					label="shortname"
					track-by="id"
					multiple
					placeholder="Click to select..."
					:class="validateMultiselect('selectedDonors')"
					:disabled="formDisabled"
					:options="options.donors"
					:loading="donorsLoading"
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
				:message="validateMsg('selectedTargetType')"
			>
				<MultiSelect
					v-model="formModel.selectedTargetType"
					label="code"
					track-by="value"
					placeholder="Click to select..."
					:options="options.targetTypes"
					:searchable="false"
					:disabled="formDisabled"
					:loading="targetTypesLoading"
					:class="validateMultiselect('selectedTargetType')"
					@select="validate('selectedTargetType')"
				/>
			</b-field>

			<b-field
				label="Total Target"
				:type="validateType('totalTarget')"
				:message="validateMsg('totalTarget', 'Required, min length is 1')"
			>
				<b-numberinput
					v-model="formModel.totalTarget"
					controls-alignment="right"
					controls-position="compact"
					expanded
					min="0"
					:disabled="formDisabled"
					:controls="!formDisabled"
					@input="validate('totalTarget')"
				/>
			</b-field>

			<b-field>
				<template #label>
					Notes<span class="optional-text has-text-weight-normal is-italic"> - Optional</span>
				</template>
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
import { Notification } from "@/utils/UI";
import { getArrayOfCodeListByKey } from "@/utils/codeList";
import { required, minValue } from "vuelidate/lib/validators";
import Validation from "@/mixins/validation";
import SectorsService from "@/services/SectorsService";
import AssistancesService from "@/services/AssistancesService";
import HomeService from "@/services/HomeService";

const minDate = (endDate, formModel) => new Date(endDate) > new Date(formModel.startDate);

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
			sectorsLoading: true,
			donorsLoading: true,
			targetTypesLoading: true,
		};
	},

	validations: {
		formModel: {
			name: { required },
			internalId: { required },
			selectedSectors: { required },
			startDate: { required },
			endDate: {
				required,
				minValue: minDate,
			},
			selectedDonors: { required },
			selectedTargetType: { required },
			totalTarget: { required, minValue: minValue(1) },
		},
	},

	mounted() {
		this.fetchSectors();
		this.fetchDonors();
		this.fetchTargetTypes();
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

		closeForm() {
			this.$emit("formClosed");
			this.$v.$reset();
		},

		async fetchSectors() {
			await SectorsService.getListOfSectors().then((response) => {
				this.options.sectors = response.data;
			}).catch((e) => {
				Notification(`Sectors ${e}`, "is-danger");
			});

			this.formModel.selectedSectors = getArrayOfCodeListByKey(this.formModel.sectors, this.options.sectors, "code");
			this.sectorsLoading = false;
		},

		async fetchDonors() {
			await HomeService.getListOfDonors().then((response) => {
				this.options.donors = response.data;
			}).catch((e) => {
				Notification(`Donors ${e}`, "is-danger");
			});

			this.formModel.selectedDonors = getArrayOfCodeListByKey(this.formModel.donorIds, this.options.donors, "id");
			this.donorsLoading = false;
		},

		async fetchTargetTypes() {
			await AssistancesService.getListOfTargetTypesForAssistances().then((response) => {
				this.options.targetTypes = response.data;
			}).catch((e) => {
				Notification(`Target Types ${e}`, "is-danger");
			});

			this.formModel.selectedTargetType = getArrayOfCodeListByKey(this.formModel.targetTypes, this.options.targetTypes, "code");
			this.targetTypesLoading = false;
		},
	},
};
</script>
