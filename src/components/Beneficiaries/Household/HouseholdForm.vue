<template>
	<form>
		<v-row>
			<v-col cols="6">
				<h4
					:data-cy="identifierBuilder('current-location-text')"
					class="mb-4"
				>
					{{ $t('Current Location') }}
				</h4>

				<LocationForm
					ref="currentLocationForm"
					:form-model="formModel.currentLocation"
					:data-cy="dataCy"
					class="mb-4"
					@locationChanged="$refs.currentTypeOfLocationForm.mapLocations()"
					@mapped="$refs.currentTypeOfLocationForm.mapLocations()"
				/>

				<DataInput
					v-model.number="formModel.latitude"
					:data-cy="prepareComponentIdentifier()"
					type="number"
					label="Latitude"
					name="latitude"
					class="mb-4"
					hide-spin-buttons
					optional
				/>

				<DataInput
					v-model.number="formModel.longitude"
					:data-cy="prepareComponentIdentifier()"
					type="number"
					label="Longitude"
					name="longitude"
					class="mb-4"
					hide-spin-buttons
					optional
				/>
			</v-col>

			<v-col cols="6">
				<h4
					:data-cy="identifierBuilder('type-of-location-text')"
					class="mb-4"
				>
					{{ $t('Type of Location') }}
				</h4>

				<TypeOfLocationForm
					ref="currentTypeOfLocationForm"
					:form-model="formModel.currentLocation"
					:data-cy="dataCy"
					is-editing
				/>
			</v-col>
		</v-row>

		<v-row>
			<v-col cols="4">
				<h4
					:data-cy="identifierBuilder('livelihood-text')"
					class="mb-4"
				>
					{{ $t('Livelihood') }}
				</h4>

				<DataSelect
					v-model="formModel.livelihood.livelihood"
					:items="options.livelihood"
					:loading="livelihoodLoading"
					:data-cy="prepareComponentIdentifier()"
					label="Livelihood"
					name="livelihood"
					class="mb-4"
					optional
				/>

				<DataInput
					v-model.number="formModel.livelihood.incomeLevel"
					:placeholder="countryCurrency"
					:data-cy="prepareComponentIdentifier()"
					type="number"
					label="Income"
					name="income"
					class="mb-4"
					min="0"
					hide-spin-buttons
					optional
				/>

				<DataInput
					v-model.number="formModel.livelihood.incomeSpentOnFood"
					:placeholder="countryCurrency"
					:data-cy="prepareComponentIdentifier()"
					type="number"
					label="Income spent on food"
					name="income-spent-on-food"
					class="mb-4"
					min="0"
					hide-spin-buttons
					optional
				/>

				<DataInput
					v-model.number="formModel.livelihood.debtLevel"
					:placeholder="countryCurrency"
					:data-cy="prepareComponentIdentifier()"
					type="number"
					label="Debt level"
					name="debt-level"
					class="mb-4"
					min="0"
					hide-spin-buttons
					optional
				/>

				<DataSelect
					v-model="formModel.livelihood.assets"
					:items="options.assets"
					:loading="assetsLoading"
					:data-cy="prepareComponentIdentifier()"
					label="Assets"
					name="assets"
					class="mb-4"
					multiple
					chips
					optional
				/>

				<DataInput
					v-model.number="formModel.livelihood.foodConsumptionScore"
					:error-messages="validationMsg('livelihood.foodConsumptionScore')"
					:data-cy="prepareComponentIdentifier()"
					type="number"
					label="Food consumption score"
					name="food-consumption-score"
					class="mb-4"
					min="0"
					hide-spin-buttons
					optional
					@update:modelValue="onValidate('livelihood.foodConsumptionScore')"
				/>

				<DataInput
					v-model.number="formModel.livelihood.copingStrategiesIndex"
					:error-messages="validationMsg('livelihood.copingStrategiesIndex')"
					:data-cy="prepareComponentIdentifier()"
					type="number"
					label="Coping strategies index"
					name="coping-strategies-index"
					class="mb-4"
					min="0"
					hide-spin-buttons
					optional
					@update:modelValue="onValidate('livelihood.copingStrategiesIndex')"
				/>
			</v-col>

			<v-col cols="4">
				<h4
					:data-cy="identifierBuilder('external-support-text')"
					class="mb-4"
				>
					{{ $t('External Support') }}
				</h4>

				<DataSelect
					v-model="formModel.externalSupport.externalSupportReceivedType"
					:items="options.externalSupportReceivedType"
					:loading="assetsLoading"
					:data-cy="prepareComponentIdentifier()"
					label="Support received types"
					name="support-received-types"
					class="mb-4"
					multiple
					chips
					optional
				/>

				<DatePicker
					v-model="formModel.externalSupport.supportDateReceived"
					:data-cy="prepareComponentIdentifier()"
					label="Support date received"
					name="support-date-received"
					class="mb-4"
					optional
				/>

				<DataInput
					v-model="formModel.externalSupport.supportOrganization"
					:data-cy="prepareComponentIdentifier()"
					label="Support organisation"
					name="support-organisation"
					class="mb-4"
					optional
				/>
			</v-col>

			<v-col cols="4">
				<h4
					:data-cy="identifierBuilder('custom-fields-text')"
					class="mb-4"
				>
					{{ $t('Custom Fields') }}
				</h4>

				<DataInput
					v-for="option in customFields"
					v-model="formModel.customFields[option.id]"
					:key="option.id"
					:label="normalizeText(option.field)"
					:name="normalizeName(option.field)"
					:type="option.type"
					:hide-spin-buttons="option.type === 'number' ? true : null"
					:data-cy="prepareComponentIdentifier()"
					class="mb-4"
					optional
				/>
			</v-col>
		</v-row>

		<v-row>
			<v-col>
				<h4
					:data-cy="identifierBuilder('household-status-text')"
					class="mb-4"
				>
					{{ $t('Household Status') }}
				</h4>

				<DataSelect
					v-model="formModel.shelterStatus"
					:items="options.shelterStatuses"
					:loading="shelterStatusLoading"
					:data-cy="prepareComponentIdentifier()"
					label="Shelter status"
					name="shelter-status"
					class="mb-4"
					optional
				/>

				<DataTextarea
					v-model="formModel.notes"
					:data-cy="prepareComponentIdentifier()"
					label="Notes"
					name="notes"
					class="mb-4"
					optional
				/>
			</v-col>
		</v-row>
	</form>
</template>

<script>
import { integer } from "@vuelidate/validators";
import BeneficiariesService from "@/services/BeneficiariesService";
import CustomFieldsService from "@/services/CustomFieldsService";
import TypeOfLocationForm from "@/components/Beneficiaries/Household/TypeOfLocationForm";
import DataInput from "@/components/Inputs/DataInput";
import DataSelect from "@/components/Inputs/DataSelect";
import DataTextarea from "@/components/Inputs/DataTextarea";
import DatePicker from "@/components/Inputs/DatePicker";
import LocationForm from "@/components/Inputs/LocationForm";
import addressHelper from "@/mixins/addressHelper";
import identifierBuilder from "@/mixins/identifierBuilder";
import validation from "@/mixins/validation";
import { getArrayOfCodeListByKey } from "@/utils/codeList";
import { kebabize, normalizeCustomFields } from "@/utils/datagrid";
import { Notification } from "@/utils/UI";
import getters from "@/store/getters";

export default {
	name: "HouseholdForm",

	components: {
		DataTextarea,
		DatePicker,
		DataSelect,
		DataInput,
		LocationForm,
		TypeOfLocationForm,
	},

	mixins: [validation, addressHelper, identifierBuilder],

	validations() {
		return {
			formModel: {
				livelihood: {
					foodConsumptionScore: { integer },
					copingStrategiesIndex: { integer },
				},
			},
		};
	},

	props: {
		detailOfHousehold: {
			type: Object,
			default: null,
		},

		isEditing: {
			type: Boolean,
			default: false,
		},

		dataCy: {
			type: String,
			default: "household-form",
		},
	},

	data() {
		return {
			shelterStatusLoading: true,
			assetsLoading: true,
			livelihoodLoading: true,
			customFields: [],
			formModel: {
				id: null,
				latitude: null,
				longitude: null,
				currentLocation: {
					typeOfLocation: null, // Must be defined, otherwise validation will not work properly
				},
				isCurrentLocationOtherThanAddress: false,
				livelihood: {
					livelihood: [],
					incomeLevel: null,
					incomeSpentOnFood: null,
					debtLevel: null,
					assets: [],
					foodConsumptionScore: null,
					copingStrategiesIndex: null,
				},
				externalSupport: {
					externalSupportReceivedType: [],
					supportDateReceived: null,
					supportOrganization: "",
				},
				customFields: {},
				shelterStatus: [],
				notes: "",
			},
			options: {
				livelihood: [],
				assets: [],
				externalSupportReceivedType: [],
				shelterStatuses: [],
			},
		};
	},

	computed: {
		countryCurrency() {
			return getters.getCountryFromVuexStorage()?.currency;
		},
	},

	async mounted() {
		await Promise.all([
			this.fetchLivelihoods(),
			this.fetchAssets(),
			this.fetchShelterStatuses(),
			this.fetchSupportReceivedTypes(),
			this.fetchCustomFields(),
		]);

		if (this.isEditing) {
			this.mapDetailOfHouseholdToFormModel();

			await this.mapCurrentLocation().then((response) => {
				this.formModel.currentLocation = { ...this.formModel.currentLocation, ...response };
			});
		}
		this.$emit("loaded");
	},

	methods: {
		normalizeText(text) {
			return normalizeCustomFields(text);
		},

		normalizeName(text) {
			return kebabize(text);
		},

		async mapCurrentLocation() {
			if (this.detailOfHousehold) {
				return this.getAddressTypeAndId(this.detailOfHousehold);
			}
			return null;
		},

		mapDetailOfHouseholdToFormModel() {
			const countryAnswers = this.prepareCustomFields(
				this.detailOfHousehold.countrySpecificAnswers,
			);

			this.formModel = {
				...this.formModel,
				id: this.detailOfHousehold.id,
				latitude: this.detailOfHousehold.latitude,
				longitude: this.detailOfHousehold.longitude,
				currentLocation: {
					typeOfLocation: null,
					adm1: null,
					adm2: null,
					adm3: null,
					adm4: null,
				},
				livelihood: {
					...this.formModel.livelihood,
					foodConsumptionScore: this.detailOfHousehold.foodConsumptionScore,
					assets: getArrayOfCodeListByKey(this.detailOfHousehold.assets, this.options.assets, "code"),
					livelihood: getArrayOfCodeListByKey([this.detailOfHousehold.livelihood], this.options.livelihood, "code"),
					incomeLevel: this.detailOfHousehold.incomeLevel,
					incomeSpentOnFood: this.detailOfHousehold.incomeSpentOnFood,
					debtLevel: this.detailOfHousehold.debtLevel,
					copingStrategiesIndex: this.detailOfHousehold.copingStrategiesIndex,
				},
				externalSupport: {
					...this.formModel.externalSupport,
					externalSupportReceivedType: getArrayOfCodeListByKey(this.detailOfHousehold.supportReceivedTypes, this.options.externalSupportReceivedType, "code"),
					supportDateReceived: this.detailOfHousehold
						.supportDateReceived ? new Date(this.detailOfHousehold.supportDateReceived) : null,
					supportOrganization: this.detailOfHousehold.supportOrganizationName,
				},
				customFields: {
					...this.formModel.customFields,
					...countryAnswers,
				},
				shelterStatus: getArrayOfCodeListByKey([`${this.detailOfHousehold.shelterStatus}`], this.options.shelterStatuses, "code"),
				notes: this.detailOfHousehold.notes,
			};
		},

		prepareCustomFields(answers) {
			const preparedAnswer = {};

			if (!answers) return preparedAnswer;

			answers.forEach(({ answer, countrySpecificId }) => {
				preparedAnswer[countrySpecificId] = answer;
			});

			return preparedAnswer;
		},

		async fetchSupportReceivedTypes() {
			await BeneficiariesService.getSupportReceivedTypes()
				.then(({ data }) => { this.options.externalSupportReceivedType = data; })
				.catch((e) => {
					Notification(`${this.$t("Support Received Types")} ${e.message || e}`, "error");
				});
		},

		async fetchLivelihoods() {
			await BeneficiariesService.getListOfLivelihoods()
				.then(({ data }) => { this.options.livelihood = data; })
				.catch((e) => {
					Notification(`${this.$t("Livelihoods")} ${e.message || e}`, "error");
				});
			this.livelihoodLoading = false;
		},

		async fetchAssets() {
			await BeneficiariesService.getListOfAssets()
				.then(({ data }) => { this.options.assets = data; })
				.catch((e) => {
					Notification(`${this.$t("Assets")} ${e.message || e}`, "error");
				});
			this.assetsLoading = false;
		},

		async fetchShelterStatuses() {
			await BeneficiariesService.getListOfShelterStatuses()
				.then(({ data }) => { this.options.shelterStatuses = data; })
				.catch((e) => {
					Notification(`${this.$t("Shelter Status")} ${e.message || e}`, "error");
				});
			this.shelterStatusLoading = false;
		},

		async fetchCustomFields() {
			try {
				const { data: { data } } = await CustomFieldsService.getListOfCustomFields(
					null,
					null,
					null,
				);

				this.customFields = data;
			} catch (e) {
				Notification(`${this.$t("Custom Fields:")} ${e.message || e}`, "error");
			}
		},

		submit() {
			const locationValid = this.$refs.currentLocationForm.submitLocationForm();
			const typeOfLocationValid = this.$refs.currentTypeOfLocationForm.submitTypeOfLocationForm();

			this.v$.$touch();

			if (this.v$.$error) {
				Notification(this.$t("Please fill all required fields in Household step"), "error");
			}

			return !this.v$.$invalid && !locationValid && !typeOfLocationValid;
		},
	},
};
</script>
