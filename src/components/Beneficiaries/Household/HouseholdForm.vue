<template>
	<form ref="householdFormComponent">
		<div class="columns is-multiline">
			<div class="column is-half">
				<h4 class="title is-4">Current Location</h4>
				<LocationForm
					ref="currentLocationForm"
					:form-model="formModel.currentLocation"
					:form-disabled="false"
					is-editing
				/>
			</div>
			<div class="column is-half">
				<h4 class="title is-4">Type Of Location</h4>
				<TypeOfLocationForm
					ref="currentTypeOfLocationForm"
					:form-model="formModel.currentLocation"
					is-editing
				/>
			</div>
		</div>
		<div class="columns is-multiline">
			<div class="column is-one-third">
				<h4 class="title is-4">Livelihood</h4>
				<b-field>
					<template #label>
						<span>Livelihood</span>
						<span class="optional-text has-text-weight-normal is-italic"> - Optional</span>
					</template>
					<MultiSelect
						v-model="formModel.livelihood.livelihood"
						searchable
						label="value"
						track-by="code"
						placeholder="Click to select..."
						:loading="livelihoodLoading"
						:options="options.livelihood"
					/>
				</b-field>

				<b-field>
					<template #label>
						<span>Income Level</span>
						<span class="optional-text has-text-weight-normal is-italic"> - Optional</span>
					</template>
					<MultiSelect
						v-model="formModel.livelihood.incomeLevel"
						searchable
						label="value"
						track-by="id"
						placeholder="Click to select..."
						:options="options.incomeLevel"
					/>
				</b-field>

				<b-field>
					<template #label>
						<span>Debt Level</span>
						<span class="optional-text has-text-weight-normal is-italic"> - Optional</span>
					</template>
					<b-numberinput
						v-model="formModel.livelihood.debtLevel"
						expanded
						min="0"
						type="is-dark"
						controls-alignment="right"
						controls-position="compact"
					/>
				</b-field>

				<b-field>
					<template #label>
						<span>Assets</span>
						<span class="optional-text has-text-weight-normal is-italic"> - Optional</span>
					</template>
					<MultiSelect
						v-model="formModel.livelihood.assets"
						searchable
						multiple
						label="value"
						track-by="code"
						placeholder="Click to select..."
						:loading="assetsLoading"
						:options="options.assets"
					/>
				</b-field>

				<b-field>
					<template #label>
						<span>Food Consumption Score</span>
						<span class="optional-text has-text-weight-normal is-italic"> - Optional</span>
					</template>
					<b-numberinput
						v-model="formModel.livelihood.foodConsumptionScore"
						expanded
						min="0"
						type="is-dark"
						controls-alignment="right"
						controls-position="compact"
					/>
				</b-field>

				<b-field>
					<template #label>
						<span>Coping Strategies Index</span>
						<span class="optional-text has-text-weight-normal is-italic"> - Optional</span>
					</template>
					<b-numberinput
						v-model="formModel.livelihood.copingStrategiesIndex"
						expanded
						min="0"
						type="is-dark"
						controls-alignment="right"
						controls-position="compact"
					/>
				</b-field>
			</div>
			<div class="column is-one-third">
				<h4 class="title is-4">External Support</h4>
				<b-field>
					<template #label>
						<span>External Support Received Type</span>
						<span class="optional-text has-text-weight-normal is-italic"> - Optional</span>
					</template>
					<MultiSelect
						v-model="formModel.externalSupport.externalSupportReceivedType"
						searchable
						multiple
						label="value"
						track-by="code"
						placeholder="Click to select..."
						:options="options.externalSupportReceivedType"
					/>
				</b-field>

				<b-field
					label="Support Date Received"
					:type="validateType('externalSupport.supportDateReceived')"
					:message="validateMsg('externalSupport.supportDateReceived')"
				>
					<b-datepicker
						v-model="formModel.externalSupport.supportDateReceived"
						show-week-number
						placeholder="Click to select..."
						icon="calendar-day"
						trap-focus
						@input="validate('externalSupport.supportDateReceived')"
					/>
				</b-field>

				<b-field>
					<template #label>
						<span>Support Organization</span>
						<span class="optional-text has-text-weight-normal is-italic"> - Optional</span>
					</template>
					<b-input v-model="formModel.externalSupport.supportOrganization" />
				</b-field>
			</div>
			<div class="column is-one-third">
				<h4 class="title is-4">Country Specific Options</h4>
				<b-field
					v-for="option in countrySpecificOptions"
					:key="option.id"
				>
					<template #label>
						<span>{{ normalizeText(option.field) }}</span>
						<span class="optional-text has-text-weight-normal is-italic"> - Optional</span>
					</template>
					<b-input v-model="formModel.countrySpecificOptions[option.id]" />
				</b-field>
			</div>
		</div>
		<h4 class="title is-4">Household Status</h4>
		<b-field>
			<template #label>
				<span>Shelter Type</span>
				<span class="optional-text has-text-weight-normal is-italic"> - Optional</span>
			</template>
			<MultiSelect
				v-model="formModel.shelterStatus"
				searchable
				label="value"
				track-by="code"
				placeholder="Click to select..."
				:loading="shelterStatusLoading"
				:options="options.shelterStatuses"
			/>
		</b-field>
		<b-field>
			<template #label>
				<span>Notes</span>
				<span class="optional-text has-text-weight-normal is-italic"> - Optional</span>
			</template>
			<b-input v-model="formModel.notes" type="textarea" />
		</b-field>
	</form>
</template>

<script>
import { required } from "vuelidate/lib/validators";
import LocationForm from "@/components/LocationForm";
import TypeOfLocationForm from "@/components/Beneficiaries/Household/TypeOfLocationForm";
import BeneficiariesService from "@/services/BeneficiariesService";
import AddressService from "@/services/AddressService";
import { Notification } from "@/utils/UI";
import { getArrayOfCodeListByKey } from "@/utils/codeList";
import { normalizeCountrySpecifics } from "@/utils/datagrid";
import Validation from "@/mixins/validation";
import CountrySpecificOptionsService from "@/services/CountrySpecificOptionsService";

export default {
	name: "HouseholdForm",

	mixins: [Validation],

	props: {
		detailOfHousehold: Object,
		isEditing: {
			type: Boolean,
			default: false,
		},
	},

	components: {
		LocationForm,
		TypeOfLocationForm,
	},

	data() {
		return {
			loadingComponent: null,
			shelterStatusLoading: true,
			assetsLoading: true,
			livelihoodLoading: true,
			countrySpecificOptions: [],
			formModel: {
				id: null,
				currentLocation: {},
				isCurrentLocationOtherThanAddress: false,
				livelihood: {
					livelihood: [],
					incomeLevel: [],
					debtLevel: 0,
					assets: [],
					foodConsumptionScore: 0,
					copingStrategiesIndex: 0,
				},
				externalSupport: {
					externalSupportReceivedType: [],
					supportDateReceived: null,
					supportOrganization: "",
				},
				countrySpecificOptions: {},
				shelterStatus: [],
				notes: "",
			},
			options: {
				livelihood: [],
				incomeLevel: [
					{ code: 0, value: "Very Low (Income < 100 USD)" },
					{ code: 1, value: "Low (100 USD < Income < 100 USD)" },
					{ code: 2, value: "Average (150 USD < Income < 250 USD)" },
					{ code: 3, value: "High (250 USD < Income < 300 USD)" },
					{ code: 4, value: "Very High (300 USD < Income)" },
				],
				assets: [],
				externalSupportReceivedType: [],
				shelterStatuses: [],
			},
		};
	},

	validations: {
		formModel: {
			livelihood: {
				livelihood: {},
				incomeLevel: {},
				debtLevel: {},
				assets: {},
				foodConsumptionScore: {},
				copingStrategiesIndex: {},
			},
			externalSupport: {
				externalSupportReceivedType: {},
				supportDateReceived: { required },
				supportOrganization: {},
			},
			countrySpecificOptions: {},
			shelterStatus: {},
		},
	},

	async mounted() {
		if (this.isEditing) {
			this.loadingComponent = this.$buefy.loading.open({
				container: this.$refs.householdFormComponent,
			});
		}

		await this.fetchLivelihoods();
		await this.fetchAssets();
		await this.fetchShelterStatuses();
		await this.fetchSupportReceivedTypes();
		await this.fetchCountrySpecificOptions();
		if (this.isEditing) {
			await this.mapDetailOfHouseholdToFormModel();

			this.loadingComponent.close();

			await this.mapCurrentLocation().then((response) => {
				this.formModel.currentLocation = response;
			});
		}
	},

	methods: {
		normalizeText(text) {
			return normalizeCountrySpecifics(text);
		},

		getAddressTypeAndId() {
			const {
				temporarySettlementAddressId,
				residenceAddressId,
				campAddressId,
			} = this.detailOfHousehold;
			if (temporarySettlementAddressId) return { typeOfLocation: "temporary_settlement", addressId: temporarySettlementAddressId };
			if (residenceAddressId) return { typeOfLocation: "residence", addressId: residenceAddressId };
			if (campAddressId) return { typeOfLocation: "camp", addressId: campAddressId };
			return "";
		},

		mapCurrentLocation() {
			if (this.detailOfHousehold) {
				const { typeOfLocation, addressId } = this.getAddressTypeAndId();

				switch (typeOfLocation) {
					case "camp":
						return AddressService.getCampAddress(addressId).catch((e) => {
							Notification(`Camp Address ${e}`, "is-danger");
						});
					case "residence":
						return AddressService.getResidenceAddress(addressId).catch((e) => {
							Notification(`Residence Address ${e}`, "is-danger");
						});
					case "temporary_settlement":
						return AddressService.getTemporarySettlementAddress(addressId).catch((e) => {
							Notification(`Temporary Settlement Address ${e}`, "is-danger");
						});
					default:
						return null;
				}
			}
			return null;
		},

		async mapDetailOfHouseholdToFormModel() {
			const countryAnswers = await this
				.prepareCountrySpecifics(this.detailOfHousehold.countrySpecificAnswerIds);
			this.formModel = {
				...this.formModel,
				id: this.detailOfHousehold.id,
				currentLocation: {},
				livelihood: {
					...this.formModel.livelihood,
					foodConsumptionScore: this.detailOfHousehold.foodConsumptionScore,
					assets: getArrayOfCodeListByKey(this.detailOfHousehold.assets, this.options.assets, "code", true),
					livelihood: getArrayOfCodeListByKey([this.detailOfHousehold.livelihood], this.options.livelihood, "code"),
					incomeLevel: getArrayOfCodeListByKey([this.detailOfHousehold.incomeLevel], this.options.incomeLevel, "code"),
					debtLevel: this.detailOfHousehold.debtLevel,
					copingStrategiesIndex: this.detailOfHousehold.copingStrategiesIndex,
				},
				externalSupport: {
					...this.formModel.externalSupport,
					externalSupportReceivedType: getArrayOfCodeListByKey(this.detailOfHousehold.supportReceivedTypes, this.options.externalSupportReceivedType, "code", false, true),
					supportDateReceived: new Date(this.detailOfHousehold.supportDateReceived),
					supportOrganization: this.detailOfHousehold.supportOrganizationName,
				},
				countrySpecificOptions: {
					...this.formModel.countrySpecificOptions,
					...countryAnswers,
				},
				shelterStatus: getArrayOfCodeListByKey([`${this.detailOfHousehold.shelterStatus}`], this.options.shelterStatuses, "code"),
				notes: this.detailOfHousehold.notes,
			};
		},

		async prepareCountrySpecifics(answers) {
			const preparedAnswer = {};
			if (!answers) return preparedAnswer;
			const promise = answers.map(async (item) => {
				await CountrySpecificOptionsService.getCountrySpecificAnswer(item)
					.then(({ data: { answer, countrySpecificOptionId } }) => {
						const temp = this.countrySpecificOptions
							.find((option) => option.id === countrySpecificOptionId);
						preparedAnswer[temp.id] = answer;
					});
			});
			await Promise.all(promise);
			return preparedAnswer;
		},

		async fetchSupportReceivedTypes() {
			await BeneficiariesService.getSupportReceivedTypes()
				.then(({ data }) => { this.options.externalSupportReceivedType = data; })
				.catch((e) => {
					Notification(`Support Received Types ${e}`, "is-danger");
				});
		},

		async fetchLivelihoods() {
			await BeneficiariesService.getListOfLivelihoods()
				.then(({ data }) => { this.options.livelihood = data; })
				.catch((e) => {
					Notification(`Livelihoods ${e}`, "is-danger");
				});
			this.livelihoodLoading = false;
		},

		async fetchAssets() {
			await BeneficiariesService.getListOfAssets()
				.then(({ data }) => { this.options.assets = data; })
				.catch((e) => {
					Notification(`Assets ${e}`, "is-danger");
				});
			this.assetsLoading = false;
		},

		async fetchShelterStatuses() {
			await BeneficiariesService.getListOfShelterStatuses()
				.then(({ data }) => { this.options.shelterStatuses = data; })
				.catch((e) => {
					Notification(`Shelter Types ${e}`, "is-danger");
				});
			this.shelterStatusLoading = false;
		},

		async fetchCountrySpecificOptions() {
			await CountrySpecificOptionsService.getListOfCountrySpecificOptions()
				.then(({ data }) => { this.countrySpecificOptions = data; })
				.catch((e) => {
					Notification(`Country Specific Options ${e}`, "is-danger");
				});
		},

		submit() {
			const locationValid = this.$refs.currentLocationForm.submitLocationForm();
			const typeOfLocationValid = this.$refs.currentTypeOfLocationForm.submitTypeOfLocationForm();

			this.$v.$touch();
			return !this.$v.$invalid && !locationValid && !typeOfLocationValid;
		},
	},
};
</script>
