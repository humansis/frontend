<template>
	<form ref="householdFormComponent">
		<div class="columns is-multiline">
			<div class="column is-half">
				<h4 class="title is-4">{{ $t('Current Location') }}</h4>
				<LocationForm
					ref="currentLocationForm"
					is-editing
					:form-model="formModel.currentLocation"
					:form-disabled="false"
					@locationChanged="$refs.currentTypeOfLocationForm.mapLocations()"
					@mapped="$refs.currentTypeOfLocationForm.mapLocations()"
				/>
			</div>
			<div class="column is-half">
				<h4 class="title is-4">{{ $t('Type of Location') }}</h4>
				<TypeOfLocationForm
					ref="currentTypeOfLocationForm"
					is-editing
					:form-model="formModel.currentLocation"
				/>
			</div>
		</div>
		<div class="columns is-multiline">
			<div class="column is-one-third">
				<h4 class="title is-4">{{ $t('Livelihood') }}</h4>
				<b-field>
					<template #label>
						<span>{{ $t('Livelihood') }}</span>
						<span class="optional-text has-text-weight-normal is-italic">
							- {{ $t('Optional') }}
						</span>
					</template>
					<MultiSelect
						v-model="formModel.livelihood.livelihood"
						searchable
						label="value"
						track-by="code"
						:placeholder="$t('Click to select')"
						:loading="livelihoodLoading"
						:options="options.livelihood"
					/>
				</b-field>

				<b-field>
					<template #label>
						<span>{{ $t('Income') }}</span>
						<span class="optional-text has-text-weight-normal is-italic">
							- {{ $t('Optional') }}
						</span>
					</template>
					<b-numberinput
						v-model="formModel.livelihood.incomeLevel"
						expanded
						min="0"
						type="is-dark"
						:controls="false"
						:placeholder="countryCurrency"
					/>
				</b-field>

				<b-field>
					<template #label>
						<span>{{ $t('Income Spent On Food') }}</span>
						<span class="optional-text has-text-weight-normal is-italic">
							- {{ $t('Optional') }}
						</span>
					</template>
					<b-numberinput
						v-model="formModel.livelihood.incomeSpentOnFood"
						expanded
						min="0"
						type="is-dark"
						:controls="false"
						:placeholder="countryCurrency"
					/>
				</b-field>

				<b-field>
					<template #label>
						<span>{{ $t('Debt Level') }}</span>
						<span class="optional-text has-text-weight-normal is-italic">
							- {{ $t('Optional') }}
						</span>
					</template>
					<b-numberinput
						v-model="formModel.livelihood.debtLevel"
						expanded
						min="0"
						type="is-dark"
						:controls="false"
						:placeholder="countryCurrency"
					/>
				</b-field>

				<b-field>
					<template #label>
						<span>{{ $t('Assets') }}</span>
						<span class="optional-text has-text-weight-normal is-italic">
							- {{ $t('Optional') }}
						</span>
					</template>
					<MultiSelect
						v-model="formModel.livelihood.assets"
						searchable
						multiple
						label="value"
						track-by="code"
						:placeholder="$t('Click to select')"
						:loading="assetsLoading"
						:options="options.assets"
					/>
				</b-field>

				<b-field>
					<template #label>
						<span>{{ $t('Food Consumption Score') }}</span>
						<span class="optional-text has-text-weight-normal is-italic">
							- {{ $t('Optional') }}
						</span>
					</template>
					<b-numberinput
						v-model="formModel.livelihood.foodConsumptionScore"
						expanded
						min="0"
						type="is-dark"
						:controls="false"
					/>
				</b-field>

				<b-field>
					<template #label>
						<span>{{ $t('Coping Strategies Index') }}</span>
						<span class="optional-text has-text-weight-normal is-italic">
							- {{ $t('Optional') }}
						</span>
					</template>
					<b-numberinput
						v-model="formModel.livelihood.copingStrategiesIndex"
						expanded
						min="0"
						type="is-dark"
						:controls="false"
					/>
				</b-field>
			</div>
			<div class="column is-one-third">
				<h4 class="title is-4">{{ $t('External Support') }}</h4>
				<b-field>
					<template #label>
						<span>{{ $t('External Support Received Type') }}</span>
						<span class="optional-text has-text-weight-normal is-italic">
							- {{ $t('Optional') }}
						</span>
					</template>
					<MultiSelect
						v-model="formModel.externalSupport.externalSupportReceivedType"
						searchable
						multiple
						label="value"
						track-by="code"
						:placeholder="$t('Click to select')"
						:options="options.externalSupportReceivedType"
					/>
				</b-field>

				<b-field>
					<template #label>
						<span>{{ $t('Support Date Received') }}</span>
						<span class="optional-text has-text-weight-normal is-italic">
							- {{ $t('Optional') }}
						</span>
					</template>
					<b-datepicker
						v-model="formModel.externalSupport.supportDateReceived"
						show-week-number
						locale="en-CA"
						icon="calendar-day"
						trap-focus
						:placeholder="$t('Click to select')"
					/>
				</b-field>

				<b-field>
					<template #label>
						<span>{{ $t('Support Organization') }}</span>
						<span class="optional-text has-text-weight-normal is-italic">
							- {{ $t('Optional') }}
						</span>
					</template>
					<b-input v-model="formModel.externalSupport.supportOrganization" />
				</b-field>
			</div>
			<div class="column is-one-third">
				<h4 class="title is-4">{{ $t('Country Specific Options') }}</h4>
				<b-field
					v-for="option in countrySpecificOptions"
					:key="option.id"
				>
					<template #label>
						<span>{{ normalizeText(option.field) }}</span>
						<span class="optional-text has-text-weight-normal is-italic">
							- {{ $t('Optional') }}
						</span>
					</template>
					<b-input
						v-if="option.type === 'text'"
						v-model="formModel.countrySpecificOptions[option.id]"
					/>
					<b-numberinput
						v-if="option.type === 'number'"
						v-model="formModel.countrySpecificOptions[option.id]"
						expanded
						min="0"
						type="is-dark"
						:controls="false"
					/>
				</b-field>
			</div>
		</div>
		<h4 class="title is-4">{{ $t('Household Status') }}</h4>
		<b-field>
			<template #label>
				<span>{{ $t('Shelter Type') }}</span>
				<span class="optional-text has-text-weight-normal is-italic">
					- {{ $t('Optional') }}
				</span>
			</template>
			<MultiSelect
				v-model="formModel.shelterStatus"
				searchable
				label="value"
				track-by="code"
				:placeholder="$t('Click to select')"
				:loading="shelterStatusLoading"
				:options="options.shelterStatuses"
			/>
		</b-field>
		<b-field>
			<template #label>
				<span>{{ $t('Notes') }}</span>
				<span class="optional-text has-text-weight-normal is-italic">
					- {{ $t('Optional') }}
				</span>
			</template>
			<b-input v-model="formModel.notes" type="textarea" />
		</b-field>
	</form>
</template>

<script>
import LocationForm from "@/components/LocationForm";
import TypeOfLocationForm from "@/components/Beneficiaries/Household/TypeOfLocationForm";
import BeneficiariesService from "@/services/BeneficiariesService";
import AddressService from "@/services/AddressService";
import { Notification } from "@/utils/UI";
import { getArrayOfCodeListByKey } from "@/utils/codeList";
import { normalizeCountrySpecifics } from "@/utils/datagrid";
import Validation from "@/mixins/validation";
import getters from "@/store/getters";
import CountrySpecificOptionsService from "@/services/CountrySpecificOptionsService";
import addressHelper from "@/mixins/addressHelper";

export default {
	name: "HouseholdForm",

	mixins: [Validation, addressHelper],

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
				countrySpecificOptions: {},
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

	validations: {
		formModel: {
			livelihood: {
				livelihood: {},
				incomeLevel: {},
				incomeSpentOnFood: {},
				debtLevel: {},
				assets: {},
				foodConsumptionScore: {},
				copingStrategiesIndex: {},
			},
			externalSupport: {
				externalSupportReceivedType: {},
				supportDateReceived: {},
				supportOrganization: {},
			},
			countrySpecificOptions: {},
			shelterStatus: {},
		},
	},

	computed: {
		countryCurrency() {
			return getters.getCountryFromVuexStorage()?.currency;
		},
	},

	async mounted() {
		if (this.isEditing) {
			this.loadingComponent = this.$buefy.loading.open({
				container: this.$refs.householdFormComponent,
			});
		}
		await Promise.all([
			this.fetchLivelihoods(),
			this.fetchAssets(),
			this.fetchShelterStatuses(),
			this.fetchSupportReceivedTypes(),
			this.fetchCountrySpecificOptions(),
		]);

		if (this.isEditing) {
			await this.mapDetailOfHouseholdToFormModel();

			this.loadingComponent.close();

			await this.mapCurrentLocation().then((response) => {
				this.formModel.currentLocation = response;
			});
		}
		this.$emit("loaded");
	},

	methods: {
		normalizeText(text) {
			return normalizeCountrySpecifics(text);
		},

		async mapCurrentLocation() {
			if (this.detailOfHousehold) {
				const { typeOfLocation, addressId } = this.getAddressTypeAndId(this.detailOfHousehold);

				switch (typeOfLocation) {
					case "camp":
						return AddressService.getCampAddress(addressId).catch((e) => {
							if (e.message) Notification(`${this.$t("Camp Address")} ${e}`, "is-danger");
						});
					case "residence":
						return AddressService.getResidenceAddress(addressId).catch((e) => {
							if (e.message) Notification(`${this.$t("Residence Address")} ${e}`, "is-danger");
						});
					case "temporary_settlement":
						return AddressService.getTemporarySettlementAddress(addressId).catch((e) => {
							if (e.message) Notification(`${this.$t("Temporary Settlement Address")} ${e}`, "is-danger");
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
						if (temp.type === "number") {
							preparedAnswer[temp.id] = Number(answer);
						} else {
							preparedAnswer[temp.id] = answer;
						}
					});
			});
			await Promise.all(promise);
			return preparedAnswer;
		},

		async fetchSupportReceivedTypes() {
			await BeneficiariesService.getSupportReceivedTypes()
				.then(({ data }) => { this.options.externalSupportReceivedType = data; })
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Support Received Types")} ${e}`, "is-danger");
				});
		},

		async fetchLivelihoods() {
			await BeneficiariesService.getListOfLivelihoods()
				.then(({ data }) => { this.options.livelihood = data; })
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Livelihoods")} ${e}`, "is-danger");
				});
			this.livelihoodLoading = false;
		},

		async fetchAssets() {
			await BeneficiariesService.getListOfAssets()
				.then(({ data }) => { this.options.assets = data; })
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Assets")} ${e}`, "is-danger");
				});
			this.assetsLoading = false;
		},

		async fetchShelterStatuses() {
			await BeneficiariesService.getListOfShelterStatuses()
				.then(({ data }) => { this.options.shelterStatuses = data; })
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Shelter Types")} ${e}`, "is-danger");
				});
			this.shelterStatusLoading = false;
		},

		async fetchCountrySpecificOptions() {
			await CountrySpecificOptionsService.getListOfCountrySpecificOptions()
				.then(({ data }) => { this.countrySpecificOptions = data; })
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Country Specific Options")} ${e}`, "is-danger");
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
