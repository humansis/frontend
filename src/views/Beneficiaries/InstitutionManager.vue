<template>
	<v-container fluid>
		<v-card class="mx-auto mt-5">
			<v-card-title class="text-h5 font-weight-bold">
				{{ $t(pageTitle) }}
			</v-card-title>

			<v-card-text>
				<v-row class="mt-1">
					<v-col>
						<h2 class="text-h6 font-weight-bold mb-2">{{ $t('General') }}</h2>

						<DataInput
							v-model="formModel.institutionName"
							:disabled="formDisabled"
							:error-messages="validationMsg('institutionName')"
							label="Institution name"
							name="institution-name"
							class="mb-6"
							@blur="onValidate('institutionName')"
						/>

						<DataSelect
							v-model="formModel.institutionType"
							:items="options.institutionTypes"
							:loading="institutionTypesLoading"
							:disabled="formDisabled"
							:clearable="!formDisabled"
							:error-messages="validationMsg('institutionType')"
							label="Institution type"
							name="institution-type"
							is-search-enabled
							class="mb-6"
							@update:modelValue="onValidate('institutionType')"
						/>

						<DataSelect
							v-model="formModel.projectName"
							:items="options.projects"
							:loading="projectsLoading"
							:disabled="formDisabled"
							:clearable="!formDisabled"
							:error-messages="validationMsg('projectName')"
							label="Project name"
							name="project-name"
							item-title="name"
							item-value="id"
							class="mb-6"
							is-search-enabled
							is-data-shown-as-tag
							multiple
							@update:modelValue="onValidate('projectName')"
						/>

						<h6 class="text-subtitle-1 mb-2">
							{{ $t('ID') }}
							<i class="optional-text">
								- {{ $t('Optional') }}
							</i>
						</h6>

						<DataInput
							v-model="formModel.firstInstitutionId"
							:label="firstInstitutionIdName"
							:disabled="formDisabled"
							name="first-institution-id"
							class="mb-6"
						/>

						<DataInput
							v-model="formModel.secondInstitutionId"
							:label="secondInstitutionIdName"
							:disabled="formDisabled"
							name="second-institution-id"
							class="mb-6"
						/>

						<DataInput
							v-model="formModel.thirdInstitutionId"
							:label="thirdInstitutionIdName"
							:disabled="formDisabled"
							name="third-institution-id"
							class="mb-6"
						/>

						<h2 class="text-h6 font-weight-bold mb-2">{{ $t('Location') }}</h2>

						<DataInput
							v-model="formModel.addressStreet"
							:disabled="formDisabled"
							label="Address street"
							name="address-street"
							class="mb-6"
							optional
						/>

						<DataInput
							v-model="formModel.addressNumber"
							:disabled="formDisabled"
							label="Address number"
							name="address-number"
							class="mb-6"
							optional
						/>

						<DataInput
							v-model="formModel.addressPostCode"
							:disabled="formDisabled"
							label="Address postcode"
							name="address-post-code"
							class="mb-6"
							optional
						/>

						<LocationForm
							ref="locationForm"
							:form-model="formModel"
							:form-disabled="formDisabled"
							is-editing
						/>

						<DataInput
							v-model="formModel.latitude"
							:disabled="formDisabled"
							label="Latitude"
							name="latitude"
							type="number"
							class="mb-6"
							hide-spin-buttons
							optional
						/>

						<DataInput
							v-model="formModel.longitude"
							:disabled="formDisabled"
							label="Longitude"
							name="longitude"
							type="number"
							class="mb-6"
							hide-spin-buttons
							optional
						/>

						<h2 class="text-h6 font-weight-bold mb-2">{{ $t('Other') }}</h2>

						<TextAreaInput
							v-model.trim="formModel.note"
							:disabled="formDisabled"
							label="Note"
							name="note"
							class="mb-6"
							optional
						/>

						<DataInput
							v-model="formModel.eloNumber"
							:disabled="formDisabled"
							label="ELO number"
							name="elo-number"
							class="mb-6"
							optional
						/>

						<DataInput
							v-model="formModel.contractNumber"
							:disabled="formDisabled"
							label="Contract number"
							name="contract-number"
							class="mb-6"
							optional
						/>
					</v-col>

					<v-col>
						<h2 class="text-h6 font-weight-bold mb-2">{{ $t('Contact') }}</h2>

						<DataInput
							v-model="formModel.contactGivenName"
							:disabled="formDisabled"
							label="Contact given name"
							name="contact-given-name"
							class="mb-6"
							optional
						/>

						<DataInput
							v-model="formModel.contactParentsName"
							:disabled="formDisabled"
							label="Contact parents name"
							name="contact-parents-name"
							class="mb-6"
							optional
						/>

						<DataInput
							v-model="formModel.contactFamilyName"
							:disabled="formDisabled"
							label="Contact family name"
							name="contact-family-name"
							class="mb-6"
							optional
						/>

						<DataSelect
							v-model="formModel.nationalCardType"
							:items="options.nationalCardTypes"
							:loading="nationalCardTypesLoading"
							:disabled="formDisabled"
							:clearable="!formDisabled"
							:error-messages="validationMsg('nationalCardType')"
							label="Contact ID type"
							name="national-card-type"
							class="mb-6"
							is-search-enabled
							optional
							@update:modelValue="onValidate('nationalCardType')"
						/>

						<DataInput
							v-model="formModel.nationalCardNumber"
							:disabled="formDisabled"
							:error-messages="validationMsg('nationalCardNumber')"
							label="Contact ID number"
							name="national-card-number"
							class="mb-6"
							optional
							@blur="onValidate('nationalCardNumber')"
						/>

						<DataInput
							v-model="formModel.otherContactInformation"
							:disabled="formDisabled"
							label="Other contact information"
							name="other-contact-information"
							class="mb-6"
							optional
						/>

						<h6 class="text-subtitle-1 mb-2">
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
									:error-messages="validationMsg('phone1.type')"
									:disabled="formDisabled"
									name="phone1-type"
									@update:modelValue="onValidate('phone1.type')"
								/>
							</v-col>

							<v-col cols="5" class="pb-2">
								<v-checkbox
									v-model="formModel.phone1.proxy"
									:label="`${$t('Contact phone')} 1`"
									:disabled="formDisabled"
									hide-details
									class="checkbox"
								/>
							</v-col>
						</v-row>

						<DataSelect
							v-model="formModel.phone1.ext"
							:items="options.phonePrefixes"
							:label="`${$t('Prefix phone')} 1`"
							:error-messages="validationMsg('phone1.ext')"
							:disabled="formDisabled"
							name="phone1-ext"
							class="mb-6"
							@update:modelValue="onValidate('phone1.ext')"
						/>

						<DataInput
							v-model="formModel.phone1.phoneNo"
							:label="`${$t('Phone No.')} 1`"
							:error-messages="validationMsg('phone1.phoneNo')"
							:disabled="formDisabled"
							name="phone1-phone-no"
							class="mb-6"
							@blur="onValidate('phone1.phoneNo')"
						/>

						<h6 class="text-subtitle-1 mb-2">
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
									:error-messages="validationMsg('phone2.type')"
									:disabled="formDisabled"
									name="phone2-type"
									@update:modelValue="onValidate('phone2.type')"
								/>
							</v-col>

							<v-col cols="5" class="pb-2">
								<v-checkbox
									v-model="formModel.phone2.proxy"
									:label="`${$t('Contact phone')} 2`"
									:disabled="formDisabled"
									hide-details
									class="checkbox"
								/>
							</v-col>
						</v-row>

						<DataSelect
							v-model="formModel.phone2.ext"
							:items="options.phonePrefixes"
							:label="`${$t('Prefix phone')} 2`"
							:error-messages="validationMsg('phone2.ext')"
							:disabled="formDisabled"
							name="phone2-ext"
							class="mb-6"
							@update:modelValue="onValidate('phone2.ext')"
						/>

						<DataInput
							v-model="formModel.phone2.phoneNo"
							:label="`${$t('Phone No.')} 2`"
							:error-messages="validationMsg('phone2.phoneNo')"
							:disabled="formDisabled"
							name="phone2-phone-no"
							class="mb-6"
							@blur="onValidate('phone2.phoneNo')"
						/>

						<h2 class="text-h6 font-weight-bold mb-2">{{ $t('External Support') }}</h2>

						<DataSelect
							v-model="formModel.externalReceivedTypes"
							:items="options.externalReceivedTypes"
							:disabled="formDisabled"
							:loading="externalSupportReceivedLoading"
							label="Support received types"
							name="external-received-types"
							class="mb-6"
							optional
						/>

						<DatePicker
							v-model="formModel.supportDateReceived"
							:disabled="formDisabled"
							label="Support date received"
							name="support-date-received"
							class="mb-6"
							optional
						/>

						<DataInput
							v-model="formModel.supportOrganization"
							:disabled="formDisabled"
							label="Support organisation"
							name="support-organization"
							class="mb-6"
							optional
						/>
					</v-col>
				</v-row>
			</v-card-text>
		</v-card>

		<v-row class="mt-5">
			<v-col class="d-flex justify-end">
				<v-btn
					color="blue-grey-lighten-4"
					size="small"
					variant="elevated"
					class="text-none"
					@click="goBack"
				>
					{{ goBackButtonName }}
				</v-btn>

				<v-btn
					v-if="!institutionAction.isDetail"
					color="primary"
					size="small"
					class="text-none ml-3"
					@click="validateNewInstitution"
				>
					{{ validateButtonName }}
				</v-btn>
			</v-col>
		</v-row>
	</v-container>
</template>

<script>
import DataInput from "@/components/Inputs/DataInput";
import DataSelect from "@/components/Inputs/DataSelect";
import DatePicker from "@/components/Inputs/DatePicker";
import LocationForm from "@/components/Inputs/LocationForm";
import TextAreaInput from "@/components/Inputs/TextAreaInput";
import idHelper from "@/mixins/idHelper";
import institutionHelper from "@/mixins/institutionHelper";
import validation from "@/mixins/validation";
import { getArrayOfIdsByParam } from "@/utils/codeList";
import { normalizeText } from "@/utils/datagrid";
import { filterEmptyValues, replaceEmptyValuesWithNull } from "@/utils/helpers";
import { INSTITUTION } from "@/consts";
import { maxLength, required, requiredIf } from "@vuelidate/validators";

export default {
	name: "InstitutionManager",

	components: {
		LocationForm,
		DataInput,
		DataSelect,
		DatePicker,
		TextAreaInput,
	},

	mixins: [validation, idHelper, institutionHelper],

	validations() {
		return {
			formModel: {
				institutionName: { required },
				institutionType: { required },
				projectName: { required },
				adm1: { required },
				nationalCardNumber: {
					maxLength: maxLength(255),
					required: requiredIf(this.formModel.nationalCardType),
				},
				nationalCardType: { required: requiredIf(this.formModel.nationalCardNumber) },
				phone1: {
					type: { required: requiredIf(this.formModel.phone1.phoneNo
							|| this.formModel.phone1.ext),
					},
					phoneNo: { required: requiredIf(this.formModel.phone1.type
							|| this.formModel.phone1.ext),
					},
					ext: { required: requiredIf(this.formModel.phone1.phoneNo
							|| this.formModel.phone1.type),
					},
				},
				phone2: {
					type: { required: requiredIf(this.formModel.phone2.phoneNo
							|| this.formModel.phone2.ext),
					},
					phoneNo: { required: requiredIf(this.formModel.phone2.type
							|| this.formModel.phone2.ext),
					},
					ext: { required: requiredIf(this.formModel.phone2.phoneNo
							|| this.formModel.phone2.type),
					},
				},
			},
		};
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
	},

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

	methods: {
		normalizeText(text) {
			return normalizeText(text);
		},

		goBack() {
			this.$router.push({ name: "Institutions" });
		},

		validateNewInstitution() {
			this.v$.$touch();
			this.$refs.locationForm.submitLocationForm();

			if (this.v$.$invalid) return;

			this.submitInstitutionForm(this.formModel);
			this.v$.$reset();
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
