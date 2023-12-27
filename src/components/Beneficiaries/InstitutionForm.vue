<template>
	<v-card-text>
		<DataInput
			v-model="formModel.institutionName"
			label="Institution name"
			name="institution-name"
			class="mb-6"
			disabled
		/>

		<DataSelect
			v-model="formModel.institutionType"
			:items="options.institutionTypes"
			label="Institution type"
			name="institution-type"
			item-title="value"
			item-value="code"
			class="mb-6"
			disabled
		/>

		<DataSelect
			v-model="formModel.projectName"
			:items="options.projects"
			label="Project name"
			name="project-name"
			item-title="name"
			item-value="id"
			class="mb-6"
			disabled
		/>

		<DataInput
			v-model="formModel.firstInstitutionId"
			:label="firstInstitutionIdName"
			name="first-institution-id"
			class="mb-6"
			optional
			disabled
		/>

		<DataInput
			v-model="formModel.secondInstitutionId"
			:label="secondInstitutionIdName"
			name="second-institution-id"
			class="mb-6"
			optional
			disabled
		/>

		<DataInput
			v-model="formModel.thirdInstitutionId"
			:label="thirdInstitutionIdName"
			name="third-institution-id"
			class="mb-6"
			optional
			disabled
		/>

		<DataInput
			v-model="formModel.addressStreet"
			label="Address street"
			name="address-street"
			class="mb-6"
			optional
			disabled
		/>

		<DataInput
			v-model="formModel.addressNumber"
			label="Address number"
			name="address-number"
			class="mb-6"
			optional
			disabled
		/>

		<DataInput
			v-model="formModel.addressPostCode"
			label="Address postcode"
			name="address-post-code"
			class="mb-6"
			optional
			disabled
		/>

		<LocationForm
			ref="locationForm"
			:form-model="formModel"
			form-disabled
		/>

		<DataInput
			v-model="formModel.latitude"
			name="latitude"
			label="Latitude"
			type="number"
			class="mb-6"
			optional
			disabled
		/>

		<DataInput
			v-model="formModel.longitude"
			label="Longitude"
			name="longitude"
			type="number"
			class="mb-6"
			optional
			disabled
		/>

		<v-textarea
			v-model="formModel.note"
			:label="$t('Note')"
			name="note"
			variant="outlined"
			density="compact"
			hide-details="auto"
			class="mb-6"
			disabled
		/>

		<DataInput
			v-model="formModel.eloNumber"
			label="ELO number"
			name="elo-number"
			class="mb-6"
			optional
			disabled
		/>

		<DataInput
			v-model="formModel.contractNumber"
			label="Contract number"
			name="contract-number"
			class="mb-6"
			optional
			disabled
		/>

		<DataInput
			v-model="formModel.contactGivenName"
			label="Contact given name"
			name="contact-given-name"
			class="mb-6"
			optional
			disabled
		/>

		<DataInput
			v-model="formModel.contactParentsName"
			label="Contact parents name"
			name="contact-parents-name"
			class="mb-6"
			optional
			disabled
		/>

		<DataInput
			v-model="formModel.contactFamilyName"
			label="Contact family Name"
			name="contact-family-name"
			class="mb-6"
			optional
			disabled
		/>

		<DataSelect
			v-model="formModel.nationalCardType"
			:items="options.nationalCardTypes"
			label="Contact ID type"
			name="national-card-type"
			item-title="code"
			item-value="value"
			class="mb-6"
			optional
			disabled
		/>

		<DataInput
			v-model="formModel.nationalCardNumber"
			label="Contact ID number"
			name="national-card-number"
			class="mb-6"
			optional
			disabled
		/>

		<DataInput
			v-model="formModel.otherContactInformation"
			label="Other contact information"
			name="other-contact-information"
			class="mb-6"
			optional
			disabled
		/>

		<h6 class="text-subtitle-1">
			{{ $t('Phone') }} 1
			<i class="optional-text">
				- {{ $t('Optional') }}
			</i>
		</h6>

		<v-row class="d-flex align-center mb-2">
			<v-col cols="7">
				<DataSelect
					v-model="formModel.phone1.type"
					:items="options.phoneTypes"
					:label="`${$t('Type phone')} 1`"
					name="phone1-type"
					disabled
				/>
			</v-col>

			<v-col cols="5" class="pb-2">
				<v-checkbox
					v-model="formModel.phone1.proxy"
					:label="`${$t('Contact phone')} 1`"
					hide-details
					class="checkbox"
					disabled
				/>
			</v-col>
		</v-row>

		<DataSelect
			v-model="formModel.phone1.ext"
			:items="options.phonePrefixes"
			:label="`${$t('Prefix phone')} 1`"
			name="phone1-ext"
			class="mb-6"
			disabled
		/>

		<DataInput
			v-model="formModel.phone1.phoneNo"
			:label="`${$t('Phone No.')} 1`"
			name="phone1-phone-no"
			class="mb-6"
			disabled
		/>

		<h6 class="text-subtitle-1">
			{{ $t('Phone') }} 2
			<i class="optional-text">
				- {{ $t('Optional') }}
			</i>
		</h6>

		<v-row class="d-flex align-center mb-2">
			<v-col cols="7">
				<DataSelect
					v-model="formModel.phone2.type"
					:items="options.phoneTypes"
					:label="`${$t('Type phone')} 2`"
					name="phone2-type"
					disabled
				/>
			</v-col>

			<v-col cols="5" class="pb-2">
				<v-checkbox
					v-model="formModel.phone2.proxy"
					:label="`${$t('Contact phone')} 2`"
					hide-details
					class="checkbox"
					disabled
				/>
			</v-col>
		</v-row>

		<DataSelect
			v-model="formModel.phone2.ext"
			:items="options.phonePrefixes"
			:label="`${$t('Prefix phone')} 2`"
			name="phone2-ext"
			class="mb-6"
			disabled
		/>

		<DataInput
			v-model="formModel.phone2.phoneNo"
			:label="`${$t('Phone No.')} 2`"
			name="phone2-phone-no"
			class="mb-6"
			disabled
		/>

		<DataSelect
			v-model="formModel.externalReceivedTypes"
			:items="options.externalReceivedTypes"
			label="Support received types"
			name="external-received-types"
			class="mb-6"
			optional
			disabled
		/>

		<DatePicker
			v-model="formModel.supportDateReceived"
			label="Support date received"
			name="support-date-received"
			optional
			disabled
		/>

		<DataInput
			v-model="formModel.supportOrganization"
			label="Support organisation"
			name="support-organization"
			class="mb-6"
			optional
			disabled
		/>
	</v-card-text>

	<v-card-actions>
		<v-spacer />

		<v-btn
			class="text-none"
			size="small"
			color="blue-grey-lighten-4"
			variant="elevated"
			@click="onCloseForm"
		>
			{{ $t('Close') }}
		</v-btn>
	</v-card-actions>
</template>

<script>
import DataInput from "@/components/Inputs/DataInput";
import DataSelect from "@/components/Inputs/DataSelect";
import DatePicker from "@/components/Inputs/DatePicker";
import LocationForm from "@/components/Inputs/LocationForm";
import institutionHelper from "@/mixins/institutionHelper";
import validation from "@/mixins/validation";

export default {
	name: "InstitutionForm",

	emits: ["formClosed"],

	components: {
		LocationForm,
		DataInput,
		DataSelect,
		DatePicker,
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
		onCloseForm() {
			this.$emit("formClosed");
		},
	},
};
</script>
