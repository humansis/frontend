<template>
	<section>
		<b-field
			:label="$t('Type of Location')"
			:type="validateType('typeOfLocation')"
			:message="validateMsg('typeOfLocation')"
		>
			<MultiSelect
				v-model="formModel.typeOfLocation"
				label="value"
				track-by="code"
				:placeholder="$t('Click to select')"
				:loading="locationTypesLoading"
				:options="options.typeOfLocation"
				:searchable="false"
				:class="validateMultiselect('typeOfLocation')"
				@select="selectTypeOfLocation"
			>
				<template slot="singleLabel" slot-scope="props">
					<div class="option__desc">
						<span class="option__title">{{ normalizeText(props.option.value) }}</span>
					</div>
				</template>
				<template slot="option" slot-scope="props">
					<div class="option__desc">
						<span class="option__title">{{ normalizeText(props.option.value) }}</span>
					</div>
				</template>
			</MultiSelect>
		</b-field>
		<div v-if="campSelected">
			<b-field
				:label="$t('Camp')"
				:type="validateType('camp')"
				:message="validateMsg('camp')"
			>
				<MultiSelect
					v-model="formModel.camp"
					label="name"
					track-by="id"
					:placeholder="$t('Click to select')"
					:options="options.camps"
					:searchable="false"
					:class="validateMultiselect('camp')"
					@select="validate('camp')"
				/>
			</b-field>

			<b-field
				grouped
				:type="validateType('campName')"
				:message="validateMsg('campName')"
			>
				<b-checkbox v-model="createCamp">{{ $t('Create a Camp') }}</b-checkbox>
				<b-input
					v-if="createCamp"
					v-model="formModel.campName"
					:placeholder="$t('Camp Name')"
					@blur="validate('campName')"
				/>
			</b-field>

			<b-field
				:label="$t('Tent Number')"
				:type="validateType('tentNumber')"
				:message="validateMsg('tentNumber')"
			>
				<b-input
					v-model="formModel.tentNumber"
					@blur="validate('tentNumber')"
				/>
			</b-field>
		</div>
		<div v-else>
			<b-field
				:label="$t('Address Number')"
				:type="validateType('number')"
				:message="validateMsg('number')"
			>
				<b-input
					v-model="formModel.number"
					@blur="validate('number')"
				/>
			</b-field>

			<b-field
				:label="$t('Address Street')"
				:type="validateType('street')"
				:message="validateMsg('street')"
			>
				<b-input
					v-model="formModel.street"
					@blur="validate('street')"
				/>
			</b-field>

			<b-field
				:label="$t('Address Postcode')"
				:type="validateType('postcode')"
				:message="validateMsg('postcode')"
			>
				<b-input
					v-model="formModel.postcode"
					@blur="validate('postcode')"
				/>
			</b-field>
		</div>
	</section>
</template>

<script>
import { required, requiredIf } from "vuelidate/lib/validators";
import BeneficiariesService from "@/services/BeneficiariesService";
import { Notification } from "@/utils/UI";
import Validation from "@/mixins/validation";
import { normalizeText } from "@/utils/datagrid";
import AddressService from "@/services/AddressService";

export default {
	name: "TypeOfLocationForm",

	mixins: [Validation],

	props: {
		formModel: Object,
		isEditing: {
			type: Boolean,
			default: false,
		},
	},

	watch: {
		formModel: "mapLocations",
	},

	data() {
		return {
			locationTypesLoading: true,
			createCamp: false,
			campSelected: false,
			options: {
				typeOfLocation: [],
				camps: [],
			},
			campsLoading: true,
		};
	},

	validations: {
		formModel: {
			typeOfLocation: { required },
			camp: { required: requiredIf((form) => form.typeOfLocation?.code === "camp" && !form.campName) },
			campName: { required: requiredIf((form) => form.typeOfLocation?.code === "camp" && !form.camp) },
			tentNumber: { required: requiredIf((form) => form.typeOfLocation?.code === "camp") },
			number: { required: requiredIf((form) => form.typeOfLocation?.code === "residence") },
			street: { required: requiredIf((form) => form.typeOfLocation?.code === "residence") },
			postcode: { required: requiredIf((form) => form.typeOfLocation?.code === "residence") },
		},
	},

	async mounted() {
		await this.fetchLocationsTypes();
		await this.fetchCamps();
	},

	methods: {
		normalizeText(text) {
			return normalizeText(text);
		},

		async fetchLocationsTypes() {
			this.locationTypesLoading = true;
			await BeneficiariesService.getListOfLocationsTypes()
				.then((result) => {
					this.options.typeOfLocation = result.data;
				})
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Location Types")} ${e}`, "is-danger");
				});
			this.locationTypesLoading = false;
		},

		async fetchCamps() {
			this.campsLoading = true;
			await AddressService.getCamps()
				.then(({ data }) => {
					this.options.camps = data;
				})
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Camps")} ${e}`, "is-danger");
				});
			this.campsLoading = false;
		},

		mapLocations() {
			if (this.formModel.type) {
				this.campSelected = this.formModel.type === "camp";
				this.formModel.typeOfLocation = this.options.typeOfLocation
					.find((item) => this.formModel.type === item.code);
			}
			if (this.formModel.campId) {
				this.campSelected = this.formModel.type === "camp";
				this.formModel.camp = this.options.camps
					.find((item) => this.formModel.campId === item.id);
			}
		},

		selectTypeOfLocation(value) {
			this.campSelected = value.code === "camp";
			this.validate("typeOfLocation");
		},

		submitTypeOfLocationForm() {
			this.$v.$touch();
			return this.$v.$invalid;
		},
	},
};
</script>
