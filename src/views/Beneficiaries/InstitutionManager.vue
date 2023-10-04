<template>
	<div>
		<section class="box">
			<h1 class="title">{{ this.pageTitle }}</h1>
			<div class="columns">
				<div class="column">
					<h2 class="title is-4">{{ $t('General') }}</h2>

					<InputWithLabel
						v-model="formModel.institutionName"
						name="institution-name"
						label="Institution name"
						validated-field-name="institutionName"
						:validation="getValidations"
						:disabled="formDisabled"
					/>

					<MultiSelectWithLabel
						v-model="formModel.institutionType"
						name="institution-type"
						label="Institution type"
						validated-field-name="institutionType"
						:validation="getValidations"
						:disabled="formDisabled"
						:loading="institutionTypesLoading"
						:options="options.institutionTypes"
					/>

					<MultiSelectWithLabel
						v-model="formModel.projectName"
						name="project-name"
						label="Project name"
						validated-field-name="projectName"
						variable-to-show="name"
						track-by="id"
						multiple
						:validation="getValidations"
						:disabled="formDisabled"
						:loading="projectsLoading"
						:options="options.projects"
					/>

					<div class="mt-4">
						<h4 class="title is-5 mb-5">
							{{ $t('ID') }}
							<span class="optional-text has-text-weight-normal is-italic">
								- {{ $t('Optional') }}
							</span>
						</h4>

						<InputWithLabel
							v-model="formModel.firstInstitutionId"
							name="first-institution-id"
							:label="firstInstitutionIdName"
							:disabled="formDisabled"
						/>

						<InputWithLabel
							v-model="formModel.secondInstitutionId"
							name="second-institution-id"
							:label="secondInstitutionIdName"
							:disabled="formDisabled"
						/>

						<InputWithLabel
							v-model="formModel.thirdInstitutionId"
							name="third-institution-id"
							:label="thirdInstitutionIdName"
							:disabled="formDisabled"
						/>
					</div>

					<h2 class="title is-4 mt-3">{{ $t('Location') }}</h2>

					<InputWithLabel
						v-model="formModel.addressStreet"
						name="address-street"
						label="Address street"
						optional
						:disabled="formDisabled"
					/>

					<InputWithLabel
						v-model="formModel.addressNumber"
						name="address-number"
						label="Address number"
						optional
						:disabled="formDisabled"
					/>

					<InputWithLabel
						v-model="formModel.addressPostCode"
						name="address-post-code"
						label="Address postcode"
						optional
						:disabled="formDisabled"
					/>

					<LocationForm
						ref="locationForm"
						is-editing
						:form-model="formModel"
						:form-disabled="formDisabled"
					/>

					<InputWithLabel
						v-model="formModel.latitude"
						name="latitude"
						label="Latitude"
						step="any"
						input-type="Number"
						field-class="mt-3"
						optional
						:controls="false"
						:disabled="formDisabled"
					/>

					<InputWithLabel
						v-model="formModel.longitude"
						name="longitude"
						label="Longitude"
						step="any"
						input-type="Number"
						field-class="mt-3"
						optional
						:controls="false"
						:disabled="formDisabled"
					/>

					<h2 class="title is-4 mt-4">{{ $t('Other') }}</h2>

					<InputWithLabel
						v-model="formModel.note"
						name="note"
						label="Note"
						type="textarea"
						optional
						:placeholder="$t('Type…')"
						:disabled="formDisabled"
					/>

					<InputWithLabel
						v-model="formModel.eloNumber"
						name="elo-number"
						label="ELO number"
						optional
						:disabled="formDisabled"
					/>

					<InputWithLabel
						v-model="formModel.contractNumber"
						name="contract-number"
						label="Contract number"
						optional
						:disabled="formDisabled"
					/>
				</div>
				<div class="column">
					<h2 class="title is-4">{{ $t('Contact') }}</h2>

					<InputWithLabel
						v-model="formModel.contactGivenName"
						name="contact-given-name"
						label="Contact given name"
						optional
						:disabled="formDisabled"
					/>

					<InputWithLabel
						v-model="formModel.contactParentsName"
						name="contact-parents-name"
						label="Contact parents name"
						optional
						:disabled="formDisabled"
					/>

					<InputWithLabel
						v-model="formModel.contactFamilyName"
						name="contact-family-name"
						label="Contact family name"
						optional
						:disabled="formDisabled"
					/>

					<MultiSelectWithLabel
						v-model="formModel.nationalCardType"
						name="national-card-type"
						label="Contact ID type"
						validated-field-name="nationalCardType"
						is-error-or-nothing
						optional
						:validation="getValidations"
						:disabled="formDisabled"
						:loading="nationalCardTypesLoading"
						:options="options.nationalCardTypes"
					/>

					<InputWithLabel
						v-model="formModel.nationalCardNumber"
						name="national-card-number"
						label="Contact ID number"
						validated-field-name="nationalCardNumber"
						is-error-or-nothing
						optional
						:validation="getValidations"
						:disabled="formDisabled"
					/>

					<InputWithLabel
						v-model="formModel.otherContactInformation"
						name="other-contact-information"
						label="Other contact information"
						optional
						:disabled="formDisabled"
					/>

					<div>
						<div class="mb-5 mt-4">
							<span class="title is-5">{{ $t('Phone') }} 1</span>
							<span class="optional-text has-text-weight-normal is-italic">
								- {{ $t('Optional') }}
							</span>
						</div>

						<MultiSelectWithLabel
							v-model="formModel.phone1.type"
							name="phone1-type"
							validated-field-name="phone1.type"
							is-error-or-nothing
							:label="`${$t('Type phone')} 1`"
							:validation="getValidations"
							:disabled="formDisabled"
							:loading="phoneTypesLoading"
							:options="options.phoneTypes"
						>
							<template #checkBox>
								<b-checkbox
									v-model="formModel.phone1.proxy"
									class="contact-phone-checkbox ml-2"
									:disabled="formDisabled"
								>
									{{ $t('Contact phone') }} 1
								</b-checkbox>
							</template>
						</MultiSelectWithLabel>

						<MultiSelectWithLabel
							v-model="formModel.phone1.ext"
							name="phone1-ext"
							validated-field-name="phone1.ext"
							is-error-or-nothing
							:label="`${$t('Prefix phone')} 1`"
							:validation="getValidations"
							:disabled="formDisabled"
							:options="options.phonePrefixes"
						/>

						<InputWithLabel
							v-model="formModel.phone1.phoneNo"
							name="phone1-phone-no"
							validated-field-name="phone1.phoneNo"
							is-error-or-nothing
							:label="`${$t('Phone No.')} 1`"
							:validation="getValidations"
							:disabled="formDisabled"
						/>
					</div>

					<div>
						<div class="mb-5 mt-4">
							<span class="title is-5">{{ $t('Phone') }} 2</span>
							<span class="optional-text has-text-weight-normal is-italic">
								- {{ $t('Optional') }}
							</span>
						</div>

						<MultiSelectWithLabel
							v-model="formModel.phone2.type"
							name="phone2-type"
							validated-field-name="phone2.type"
							is-error-or-nothing
							:label="`${$t('Type phone')} 2`"
							:validation="getValidations"
							:disabled="formDisabled"
							:loading="phoneTypesLoading"
							:options="options.phoneTypes"
						>
							<template #checkBox>
								<b-checkbox
									v-model="formModel.phone2.proxy"
									class="contact-phone-checkbox ml-2"
									:disabled="formDisabled"
								>
									{{ $t('Contact phone') }} 2
								</b-checkbox>
							</template>
						</MultiSelectWithLabel>

						<MultiSelectWithLabel
							v-model="formModel.phone2.ext"
							name="phone2-ext"
							validated-field-name="phone2.ext"
							is-error-or-nothing
							:label="`${$t('Prefix phone')} 2`"
							:validation="getValidations"
							:disabled="formDisabled"
							:options="options.phonePrefixes"
						/>

						<InputWithLabel
							v-model="formModel.phone2.phoneNo"
							name="phone2-phone-no"
							validated-field-name="phone2.phoneNo"
							is-error-or-nothing
							:label="`${$t('Phone No.')} 2`"
							:validation="getValidations"
							:disabled="formDisabled"
						/>
					</div>

					<h2 class="title is-4 mt-4">{{ $t('External Support') }}</h2>

					<MultiSelectWithLabel
						v-model="formModel.externalReceivedTypes"
						name="external-received-types"
						label="Support received types"
						optional
						:disabled="formDisabled"
						:loading="externalSupportReceivedLoading"
						:options="options.externalReceivedTypes"
					/>

					<DatePickerWithLabel
						v-model="formModel.supportDateReceived"
						name="support-date-received"
						label="Support date received"
						locale="en-CA"
						icon="calendar-day"
						show-week-number
						trap-focus
						optional
						:disabled="formDisabled"
					/>

					<InputWithLabel
						v-model="formModel.supportOrganization"
						name="support-organization"
						label="Support organisation"
						optional
						:disabled="formDisabled"
					/>
				</div>
			</div>
		</section>

		<div v-if="institutionLoading && !institutionAction.isCreate">
			<b-loading :is-full-page="false" :active="true" />
		</div>

		<div class="buttons flex-end mt-5 pb-5">
			<b-button @click="goBack">{{ goBackButtonName }}</b-button>

			<b-button
				v-if="!institutionAction.isDetail"
				type="is-primary"
				@click="validateNewInstitution"
			>
				{{ validateButtonName }}
			</b-button>
		</div>
	</div>
</template>

<script>
import { maxLength, required, requiredIf } from "vuelidate/lib/validators";
import LocationForm from "@/components/LocationForm";
import InputWithLabel from "@/components/Inputs/InputWithLabel";
import MultiSelectWithLabel from "@/components/Inputs/MultiSelectWithLabel";
import DatePickerWithLabel from "@/components/Inputs/DatePickerWithLabel";
import validation from "@/mixins/validation";
import calendarHelper from "@/mixins/calendarHelper";
import institutionHelper from "@/mixins/institutionHelper";
import idHelper from "@/mixins/idHelper";
import { normalizeText } from "@/utils/datagrid";
import { filterEmptyValues, replaceEmptyValuesWithNull } from "@/utils/helpers";
import { getArrayOfIdsByParam } from "@/utils/codeList";
import { INSTITUTION } from "@/consts";

export default {
	name: "InstitutionManager",

	components: {
		LocationForm,
		InputWithLabel,
		MultiSelectWithLabel,
		DatePickerWithLabel,
	},

	mixins: [validation, calendarHelper, idHelper, institutionHelper],

	async mounted() {
		this.institutionLoading = true;
		this.getInstitutionAction();

		await Promise.all([
			this.fetchInstitutionIdNames(),
			this.fetchPhoneTypes(),
			this.fetchSupportReceivedTypes(),
			this.fetchNationalCardTypes(),
			this.fetchProjects(),
			this.fetchInstitutionTypes(),
		]);

		if (!this.institutionAction.isCreate) {
			await this.fetchInstitution();
		}

		this.institutionLoading = false;
	},

	data() {
		return {
			formModel: { ...INSTITUTION.DEFAULT_FORM_MODEL },
			projectsLoading: false,
			phoneTypesLoading: false,
			externalSupportReceivedLoading: false,
			nationalCardTypesLoading: false,
			institutionTypesLoading: false,
			institutionLoading: false,
			institutionAction: {},
			pageTitle: "",
			formDisabled: false,
		};
	},

	validations: {
		formModel: {
			institutionName: { required },
			institutionType: { required },
			projectName: { required },
			adm1: { required },
			nationalCardNumber: {
				maxLength: maxLength(255),
				required: requiredIf((form) => form.nationalCardType),
			},
			nationalCardType: { required: requiredIf((form) => form.nationalCardNumber) },
			phone1: {
				type: { required: requiredIf((form) => form.phoneNo || form.ext) },
				phoneNo: { required: requiredIf((form) => form.type || form.ext) },
				ext: { required: requiredIf((form) => form.phoneNo || form.type) },
			},
			phone2: {
				type: { required: requiredIf((form) => form.phoneNo || form.ext) },
				phoneNo: { required: requiredIf((form) => form.type || form.ext) },
				ext: { required: requiredIf((form) => form.phoneNo || form.type) },
			},
		},
	},

	computed: {
		validateButtonName() {
			return this.$t(this.institutionAction.isCreate ? "Create" : "Update");
		},

		goBackButtonName() {
			return this.$t(this.institutionAction.isDetail ? "Close" : "Cancel");
		},

		institutionId() {
			return this.$route.params.institutionId;
		},

		getValidations() {
			return this.$v;
		},
	},

	methods: {
		normalizeText(text) {
			return normalizeText(text);
		},

		goBack() {
			this.$router.push({ name: "Institutions" });
		},

		validateNewInstitution() {
			this.$v.$touch();
			this.$refs.locationForm.submitLocationForm();
			if (this.$v.$invalid) return;

			this.submitInstitutionForm(this.formModel);
			this.$v.$reset();
		},

		submitInstitutionForm(institutionForm) {
			const {
				id,
				institutionName,
				institutionType,
				projectName,
				firstInstitutionId,
				secondInstitutionId,
				thirdInstitutionId,
				addressStreet,
				addressNumber,
				addressPostCode,
				locationId,
				latitude,
				longitude,
				note,
				eloNumber,
				contractNumber,
				contactGivenName,
				contactParentsName,
				contactFamilyName,
				nationalCardType,
				nationalCardNumber,
				otherContactInformation,
				phone1,
				phone2,
				externalReceivedTypes,
				supportDateReceived,
				supportOrganization,
			} = institutionForm;

			const address = {
				...addressStreet?.length && { street: addressStreet },
				...addressNumber?.length && { number: addressNumber },
				...addressPostCode?.length && { postCode: addressPostCode },
				locationId,
			};
			const nationalIdCard = {
				...nationalCardType?.code && { type: nationalCardType.code },
				...nationalCardNumber?.length && { number: nationalCardNumber },
			};
			const phone = {
				...phone1.ext?.code && { prefix: phone1.ext.code },
				...phone1.phoneNo?.length && { number: phone1.phoneNo },
				...phone1.type?.code && { type: phone1.type.code },
				...phone1.ext?.code
					&& phone1.phoneNo?.length
					&& phone1.type?.code
					&& { proxy: phone1.proxy },
			};
			const secondPhone = {
				...phone2.ext?.code && { prefix: phone2.ext.code },
				...phone2.phoneNo?.length && { number: phone2.phoneNo },
				...phone2.type?.code && { type: phone2.type.code },
				...phone2.ext?.code
					&& phone2.phoneNo?.length
					&& phone2.type?.code
					&& { proxy: phone2.proxy },
			};
			const modifiedSupportDateReceived = supportDateReceived
				? this.$moment(supportDateReceived).format("YYYY-MM-DD")
				: null;

			const institutionBody = {
				name: institutionName,
				projectIds: getArrayOfIdsByParam(projectName, "id"),
				type: institutionType.code,
				idNumber1: firstInstitutionId,
				idNumber2: secondInstitutionId,
				idNumber3: thirdInstitutionId,
				address,
				latitude,
				longitude,
				note,
				eloNumber,
				contractNumber,
				contactGivenName,
				contactFamilyName,
				contactParentsName,
				nationalIdCard,
				otherContactInformation,
				phone,
				secondPhone,
				supportReceivedTypes: externalReceivedTypes?.code,
				supportDateReceived: modifiedSupportDateReceived,
				supportOrganizationName: supportOrganization,
			};

			if (this.institutionAction.isEdit && id) {
				this.updateInstitution(id, replaceEmptyValuesWithNull(institutionBody));
			} else {
				this.createInstitution(filterEmptyValues(institutionBody));
			}
		},

		getInstitutionAction() {
			switch (this.$route.name) {
				case "InstitutionDetail":
					this.institutionAction = {
						isCreate: false,
						isEdit: false,
						isDetail: true,
					};

					this.pageTitle = `${this.$t("Detail of Institution")} (${this.$t("ID")}: ${this.institutionId})`;
					this.formDisabled = true;

					break;
				case "InstitutionEdit":
					this.institutionAction = {
						isCreate: false,
						isEdit: true,
						isDetail: false,
					};

					this.pageTitle = `${this.$t("Institution Edit")} (${this.$t("ID")}: ${this.institutionId})`;
					this.formDisabled = false;

					break;
				default:
					this.institutionAction = {
						isCreate: true,
						isEdit: false,
						isDetail: false,
					};

					this.pageTitle = this.$t("Create New Institution");
					this.formDisabled = false;

					break;
			}
		},
	},
};
</script>

<style lang="scss" scoped>
.contact-phone-checkbox {
	white-space: nowrap;
}

.b-tabs ::v-deep {
	.tab-content {
		padding-left: 0;
		padding-right: 0;
	}

	ul > li > a {
		padding-left: 0;
	}
}
</style>
