<template>
	<form>
		<section class="modal-card-body">
			<InputWithLabel
				v-model="formModel.institutionName"
				name="institution-name"
				label="Institution name"
				disabled
			/>

			<MultiSelectWithLabel
				v-model="formModel.institutionType"
				name="institution-type"
				label="Institution type"
				disabled
				:options="options.institutionTypes"
			/>

			<MultiSelectWithLabel
				v-model="formModel.projectName"
				name="project-name"
				label="Project name"
				variable-to-show="name"
				track-by="id"
				disabled
				:options="options.projects"
			/>

			<InputWithLabel
				v-model="formModel.firstInstitutionId"
				name="first-institution-id"
				optional
				disabled
				:label="firstInstitutionIdName"
			/>

			<InputWithLabel
				v-model="formModel.secondInstitutionId"
				name="second-institution-id"
				optional
				disabled
				:label="secondInstitutionIdName"
			/>

			<InputWithLabel
				v-model="formModel.thirdInstitutionId"
				name="third-institution-id"
				optional
				disabled
				:label="thirdInstitutionIdName"
			/>

			<InputWithLabel
				v-model="formModel.addressStreet"
				name="address-street"
				label="Address street"
				optional
				disabled
			/>

			<InputWithLabel
				v-model="formModel.addressNumber"
				name="address-number"
				label="Address number"
				optional
				disabled
			/>

			<InputWithLabel
				v-model="formModel.addressPostCode"
				name="address-post-code"
				label="Address postcode"
				optional
				disabled
			/>

			<LocationForm
				ref="locationForm"
				:form-model="formModel"
				form-disabled
			/>

			<InputWithLabel
				v-model="formModel.latitude"
				name="latitude"
				label="Latitude"
				step="any"
				input-type="Number"
				field-class="mt-3"
				optional
				disabled
				:controls="false"
			/>

			<InputWithLabel
				v-model="formModel.longitude"
				name="longitude"
				label="Longitude"
				step="any"
				input-type="Number"
				optional
				disabled
				:controls="false"
			/>

			<InputWithLabel
				v-model="formModel.note"
				name="note"
				label="Note"
				type="textarea"
				optional
				disabled
				:placeholder="$t('Type…')"
			/>

			<InputWithLabel
				v-model="formModel.eloNumber"
				name="elo-number"
				label="ELO number"
				optional
				disabled
			/>

			<InputWithLabel
				v-model="formModel.contractNumber"
				name="contract-number"
				label="Contract number"
				optional
				disabled
			/>

			<InputWithLabel
				v-model="formModel.contactGivenName"
				name="contact-given-name"
				label="Contact given name"
				optional
				disabled
			/>

			<InputWithLabel
				v-model="formModel.contactParentsName"
				name="contact-parents-name"
				label="Contact parents name"
				optional
				disabled
			/>

			<InputWithLabel
				v-model="formModel.contactFamilyName"
				name="contact-family-name"
				label="Contact family Name"
				optional
				disabled
			/>

			<MultiSelectWithLabel
				v-model="formModel.nationalCardType"
				name="national-card-type"
				label="Contact ID type"
				optional
				disabled
				:options="options.nationalCardTypes"
			/>

			<InputWithLabel
				v-model="formModel.nationalCardNumber"
				name="national-card-number"
				label="Contact ID number"
				optional
				disabled
			/>

			<InputWithLabel
				v-model="formModel.otherContactInformation"
				name="other-contact-information"
				label="Other contact information"
				optional
				disabled
			/>

			<h4 class="title is-5 mb-3">
				{{ $t('Phone') }} 1
				<span class="optional-text has-text-weight-normal is-italic">
					- {{ $t('Optional') }}
				</span>
			</h4>

			<MultiSelectWithLabel
				v-model="formModel.phone1.type"
				name="phone1-type"
				disabled
				:label="`${$t('Type phone')} 1`"
				:options="options.phoneTypes"
			>
				<template #checkBox>
					<b-checkbox
						v-model="formModel.phone1.proxy"
						class="contact-phone-checkbox ml-2"
						disabled
					>
						{{ $t('Contact phone') }} 1
					</b-checkbox>
				</template>
			</MultiSelectWithLabel>

			<MultiSelectWithLabel
				v-model="formModel.phone1.ext"
				name="phone1-ext"
				disabled
				:label="`${$t('Prefix phone')} 1`"
				:options="options.phonePrefixes"
			/>

			<InputWithLabel
				v-model="formModel.phone1.phoneNo"
				name="phone1-phone-no"
				disabled
				:label="`${$t('Phone No.')} 1`"
			/>

			<h4 class="title is-5 mb-3">
				{{ $t('Phone') }} 2
				<span class="optional-text has-text-weight-normal is-italic">
					- {{ $t('Optional') }}
				</span>
			</h4>

			<MultiSelectWithLabel
				v-model="formModel.phone2.type"
				name="phone2-type"
				disabled
				:label="`${$t('Type phone')} 2`"
				:options="options.phoneTypes"
			>
				<template #checkBox>
					<b-checkbox
						v-model="formModel.phone2.proxy"
						class="contact-phone-checkbox ml-2"
						disabled
					>
						{{ $t('Contact phone') }} 2
					</b-checkbox>
				</template>
			</MultiSelectWithLabel>

			<MultiSelectWithLabel
				v-model="formModel.phone2.ext"
				name="phone2-ext"
				disabled
				:label="`${$t('Prefix phone')} 2`"
				:options="options.phonePrefixes"
			/>

			<InputWithLabel
				v-model="formModel.phone2.phoneNo"
				name="phone2-phone-no"
				disabled
				:label="`${$t('Phone No.')} 2`"
			/>

			<MultiSelectWithLabel
				v-model="formModel.externalReceivedTypes"
				name="external-received-types"
				label="Support received types"
				optional
				disabled
				:options="options.externalReceivedTypes"
			/>

			<DatePickerWithLabel
				v-model="formModel.supportDateReceived"
				name="support-date-received"
				label="Support date received"
				show-week-number
				locale="en-CA"
				icon="calendar-day"
				trap-focus
				optional
				disabled
			/>

			<InputWithLabel
				v-model="formModel.supportOrganization"
				name="support-organization"
				label="Support organisation"
				optional
				disabled
			/>
		</section>

		<footer class="modal-card-foot">
			<b-button @click="closeForm">
				{{ $t('Close') }}
			</b-button>
		</footer>
	</form>
</template>

<script>
import LocationForm from "@/components/LocationForm";
import InputWithLabel from "@/components/Inputs/InputWithLabel";
import MultiSelectWithLabel from "@/components/Inputs/MultiSelectWithLabel";
import DatePickerWithLabel from "@/components/Inputs/DatePickerWithLabel";
import validation from "@/mixins/validation";
import institutionHelper from "@/mixins/institutionHelper";

export default {
	name: "InstitutionForm",

	components: {
		LocationForm,
		InputWithLabel,
		MultiSelectWithLabel,
		DatePickerWithLabel,
	},

	mixins: [validation, institutionHelper],

	props: {
		formModel: {
			type: Object,
			required: true,
		},

		institutionModal: {
			type: Object,
			required: true,
		},
	},

	methods: {
		closeForm() {
			this.$emit("formClosed");
		},
	},
};
</script>

<style lang="scss" scoped>
.contact-phone-checkbox {
	white-space: nowrap;
}
</style>
