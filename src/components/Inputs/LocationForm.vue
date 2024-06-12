<template>
	<section>
		<DataSelect
			v-model="formModel.adm1"
			:items="options.provinces"
			:label="admNames.adm1"
			:error-messages="validateMsgForAdm1"
			:optional="isAdm1Optional"
			:loading="provincesLoading"
			:disabled="formDisabled || disabledAdm.adm1"
			:clearable="!disabledAdmClear.adm1"
			:data-cy="prepareComponentIdentifier()"
			:name="admNames.adm1"
			item-title="name"
			item-value="id"
			class="mb-4"
			@update:modelValue="onProvinceSelect"
		/>

		<DataSelect
			v-model="formModel.adm2"
			:items="options.districts"
			:label="admNames.adm2"
			:loading="districtsLoading"
			:disabled="formDisabled || disabledAdm.adm2"
			:clearable="!disabledAdmClear.adm2"
			:data-cy="prepareComponentIdentifier()"
			:name="admNames.adm2"
			item-title="name"
			item-value="id"
			class="mb-4"
			optional
			@update:modelValue="onDistrictSelect"
		/>

		<DataSelect
			v-model="formModel.adm3"
			:items="options.communes"
			:label="admNames.adm3"
			:loading="communesLoading"
			:disabled="formDisabled || disabledAdm.adm3"
			:clearable="!disabledAdmClear.adm3"
			:data-cy="prepareComponentIdentifier()"
			:name="admNames.adm3"
			item-title="name"
			item-value="id"
			class="mb-4"
			optional
			@update:modelValue="onCommuneSelect"
		/>

		<p
			v-if="influenceDistributionProtocol.subDistrict"
			class="text-caption text-red"
		>
			{{ distributionProtocolMessage }}
		</p>

		<DataSelect
			v-model="formModel.adm4"
			:items="options.villages"
			:label="admNames.adm4"
			:loading="villagesLoading"
			:disabled="formDisabled || disabledAdm.adm4"
			:clearable="!disabledAdmClear.adm4"
			:data-cy="prepareComponentIdentifier()"
			:name="admNames.adm4"
			item-title="name"
			item-value="id"
			class="mb-4"
			optional
			@update:modelValue="onVillageSelect"
		/>

		<p
			v-if="influenceDistributionProtocol.village"
			class="text-caption text-red mb-3"
		>
			{{ distributionProtocolMessage }}
		</p>
	</section>
</template>

<script>
import { mapState } from "vuex";
import { requiredIf } from "@vuelidate/validators";
import AddressService from "@/services/AddressService";
import LocationsService from "@/services/LocationsService";
import DataSelect from "@/components/Inputs/DataSelect";
import identifierBuilder from "@/mixins/identifierBuilder";
import validation from "@/mixins/validation";
import { getArrayOfCodeListByKey } from "@/utils/codeList";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";
import { GENERAL } from "@/consts";

export default {
	name: "LocationForm",

	components: {
		DataSelect,
	},

	mixins: [validation, identifierBuilder],

	validations() {
		return {
			formModel: {
			// eslint-disable-next-line func-names
				adm1: { required: requiredIf(function () {
					return !this.isAdm1Optional;
				}) },
				adm2: {},
				adm3: {},
				adm4: {},
			},
		};
	},

	props: {
		formModel: {
			type: Object,
			required: true,
		},

		formDisabled: {
			type: Boolean,
			default: false,
		},

		disabledAdm: {
			type: Object,
			default: () => ({
				adm1: false,
				adm2: false,
				adm3: false,
				adm4: false,
			}),
		},

		isEditing: {
			type: Boolean,
			default: false,
		},

		influenceDistributionProtocol: {
			type: Object,
			default: () => ({
				subDistrict: false,
				village: false,
			}),
		},

		distributionProtocolMessage: {
			type: String,
			default: "",
		},

		isAdm1Optional: {
			type: Boolean,
			default: false,
		},

		disabledAdmClear: {
			type: Object,
			default: () => ({
				adm1: false,
				adm2: false,
				adm3: false,
				adm4: false,
			}),
		},

		dataCy: {
			type: String,
			default: "",
		},
	},

	data() {
		return {
			mapping: true,
			locationId: null,
			componentKey: 0,
			options: {
				provinces: [],
				districts: [],
				communes: [],
				villages: [],
			},
			provincesLoading: false,
			districtsLoading: false,
			communesLoading: false,
			villagesLoading: false,
		};
	},

	computed: {
		...mapState(["admNames"]),

		validateMsgForAdm1() {
			return this.isAdm1Optional ? "" : this.validationMsg("adm1");
		},
	},

	watch: {
		formModel: "mapLocations",
	},

	async mounted() {
		await Promise.all([this.fetchProvinces()]);

		if (this.formModel) {
			await this.mapLocations();
		}

		if (this.isEditing && this.formModel.adm1) {
			await this.fetchDistricts(this.formModel.adm1?.id);

			if (this.formModel.adm2) {
				await this.fetchCommunes(this.formModel.adm2?.id);

				if (this.formModel.adm3) {
					await this.fetchVillages(this.formModel.adm3?.id);
				}
			}
		}
	},

	methods: {
		submitLocationForm() {
			this.v$.$touch();
			return this.v$.$invalid;
		},

		onProvinceSelect(location) {
			if (!location) {
				this.formModel.locationId = null;
			} else {
				this.formModel.locationId = location.locationId;
				this.onValidate("adm1");
				this.fetchDistricts(location.id);
			}
			this.componentKey += 1;
			this.eraseData("adm1");
			this.$emit("locationChanged", "adm1");
		},

		onDistrictSelect(location) {
			if (!location) {
				this.formModel.locationId = this.formModel.adm1.locationId;
			} else {
				this.formModel.locationId = location.locationId;
				this.onValidate("adm2");
				this.fetchCommunes(location.id);
			}
			this.componentKey += 1;
			this.eraseData("adm2");
			this.$emit("locationChanged", "adm2");
		},

		onCommuneSelect(location) {
			if (!location) {
				this.formModel.locationId = this.formModel.adm2.locationId;
			} else {
				this.formModel.locationId = location.locationId;
				this.onValidate("adm3");
				this.fetchVillages(location.id);
			}
			this.componentKey += 1;
			this.eraseData("adm3");
			this.$emit("locationChanged", "adm3");
		},

		onVillageSelect(location) {
			if (!location) {
				this.formModel.locationId = this.formModel.adm3.locationId;
			} else {
				this.formModel.locationId = location.locationId;
				this.onValidate("adm4");
			}
			this.componentKey += 1;
			this.$emit("locationChanged", "adm4");
		},

		async fetchProvinces() {
			try {
				this.provincesLoading = true;

				const {
					data: { data },
					status,
					message,
				} = await LocationsService.getListOfAdm1();

				checkResponseStatus(status, message);

				this.options.provinces = data;
			} catch (e) {
				Notification(`${this.$t("Adm1")}: ${e.message || e}`, "error");
			} finally {
				this.provincesLoading = false;
			}
		},

		async fetchDistricts(adm1Id) {
			try {
				this.districtsLoading = true;

				const {
					data: { data },
					status,
					message,
				} = await LocationsService.getListOfAdm2(adm1Id);

				checkResponseStatus(status, message);

				this.options.districts = data;
			} catch (e) {
				Notification(`${this.$t("Adm2")}: ${e.message || e}`, "error");
			} finally {
				this.districtsLoading = false;
			}
		},

		async fetchCommunes(adm2Id) {
			try {
				this.communesLoading = true;

				const {
					data: { data },
					status,
					message,
				} = await LocationsService.getListOfAdm3(adm2Id);

				checkResponseStatus(status, message);

				this.options.communes = data;
			} catch (e) {
				Notification(`${this.$t("Adm3")}: ${e.message || e}`, "error");
			} finally {
				this.communesLoading = false;
			}
		},

		async fetchVillages(adm3Id) {
			try {
				this.villagesLoading = true;

				const {
					data: { data },
					status,
					message,
				} = await LocationsService.getListOfAdm4(adm3Id);

				checkResponseStatus(status, message);

				this.options.villages = data;
			} catch (e) {
				Notification(`${this.$t("Adm4")}: ${e.message || e}`, "error");
			} finally {
				this.villagesLoading = false;
			}
		},

		async fetchCamps(id) {
			try {
				const {
					data,
					status,
					message,
				} = await AddressService.getCamp(id);

				checkResponseStatus(status, message);

				this.formModel.adm1Id = data.adm1Id;
				this.formModel.adm2Id = data.adm2Id;
				this.formModel.adm3Id = data.adm3Id;
				this.formModel.adm4Id = data.adm4Id;
				this.formModel.locationId = data.locationId;
			} catch (e) {
				Notification(`${this.$t("Camp")}: ${e.message || e}`, "error");
			}
		},

		async mapLocations() {
			this.mapping = true;
			if (this.formModel.type === GENERAL.LOCATION_TYPE.camp.type && this.formModel.campId) {
				await this.fetchCamps(this.formModel.campId);
			}
			const { adm1Id, adm2Id, adm3Id, adm4Id } = this.formModel;

			if (adm1Id && typeof adm1Id !== "object") {
				this.formModel.adm1 = getArrayOfCodeListByKey([adm1Id], this.options.provinces, "id");
				this.formModel.locationId = this.formModel.adm1.locationId;
				await this.fetchDistricts(adm1Id);
			}
			if (adm2Id && typeof adm2Id !== "object") {
				this.formModel.adm2 = getArrayOfCodeListByKey([adm2Id], this.options.districts, "id");
				this.formModel.locationId = this.formModel.adm2.locationId;
				await this.fetchCommunes(adm2Id);
			}
			if (adm3Id && typeof adm3Id !== "object") {
				this.formModel.adm3 = getArrayOfCodeListByKey([adm3Id], this.options.communes, "id");
				this.formModel.locationId = this.formModel.adm3.locationId;
				await this.fetchVillages(adm3Id);
			}
			if (adm4Id && typeof adm4Id !== "object") {
				this.formModel.adm4 = getArrayOfCodeListByKey([adm4Id], this.options.villages, "id");
				this.formModel.locationId = this.formModel.adm4.locationId;
			}

			for (let i = 1; i <= 4; i += 1) {
				delete this.formModel[`adm${i}Id`];
			}

			this.mapping = false;
			this.$emit("mapped");
			this.mapping = false;
		},

		eraseData(type) {
			switch (type) {
				case "adm1":
					this.formModel.adm2 = null;
					this.formModel.adm3 = null;
					this.formModel.adm4 = null;
					this.options.districts = [];
					this.options.communes = [];
					this.options.villages = [];
					break;
				case "adm2":
					this.formModel.adm3 = null;
					this.formModel.adm4 = null;
					this.options.communes = [];
					this.options.villages = [];
					break;
				case "adm3":
					this.formModel.adm4 = null;
					this.options.villages = [];
					break;
				default:
					break;
			}
		},
	},
};
</script>
