<template>
	<section>
		<b-field
			label="Type Of Location"
			:type="validateType('typeOfLocation')"
			:message="validateMsg('typeOfLocation')"
		>
			<MultiSelect
				v-model="formModel.typeOfLocation"
				label="value"
				track-by="code"
				placeholder="Click to select..."
				:loading="locationTypesLoading"
				:options="options.typeOfLocation"
				:searchable="false"
				:class="validateMultiselect('typeOfLocation')"
				@select="selectTypeOfLocation"
			/>
		</b-field>
		<div v-if="campSelected">
			<b-field
				label="Camp"
				:type="validateType('camp')"
				:message="validateMsg('camp')"
			>
				<MultiSelect
					v-model="formModel.camp"
					placeholder="Click to select..."
					:options="options.camps"
					:searchable="false"
					:class="validateMultiselect('camp')"
					@select="validate('camp')"
				/>
			</b-field>

			<b-field
				grouped
				label="Camp Name"
				:type="validateType('campName')"
				:message="validateMsg('campName')"
			>
				<b-checkbox v-model="createCamp">Create A Camp</b-checkbox>
				<b-input
					v-if="createCamp"
					v-model="formModel.campName"
					placeholder="Camp name"
					@blur="validate('campName')"
				/>
			</b-field>

			<b-field
				label="Tent Number"
				:type="validateType('tentNumber')"
				:message="validateMsg('tentNumber')"
			>
				<b-input
					v-model="formModel.tentNumber"
					placeholder="Tent Number"
					@blur="validate('tentNumber')"
				/>
			</b-field>
		</div>
		<div v-else>
			<b-field
				label="Address Number"
				:type="validateType('number')"
				:message="validateMsg('number')"
			>
				<b-input
					v-model="formModel.number"
					placeholder="Address Number"
					@blur="validate('number')"
				/>
			</b-field>

			<b-field
				label="Address Street"
				:type="validateType('street')"
				:message="validateMsg('street')"
			>
				<b-input
					v-model="formModel.street"
					placeholder="Address Street"
					@blur="validate('street')"
				/>
			</b-field>

			<b-field
				label="Address Postcode"
				:type="validateType('postcode')"
				:message="validateMsg('postcode')"
			>
				<b-input
					v-model="formModel.postcode"
					placeholder="Address Postcode"
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

export default {
	name: "TypeOfLocationForm",

	props: {
		formModel: Object,
		isEditing: {
			type: Boolean,
			default: false,
		},
	},

	mixins: [Validation],

	watch: {
		formModel: "mapLocations",
	},

	data() {
		return {
			locationTypesLoading: false,
			createCamp: false,
			campSelected: false,
			options: {
				typeOfLocation: [],
				// TODO camps
				camps: [],
			},
		};
	},

	validations: {
		formModel: {
			typeOfLocation: { required },
			camp: { required: requiredIf((form) => form.typeOfLocation.code === "camp") },
			campName: { required: requiredIf((form) => form.typeOfLocation.code === "camp") },
			tentNumber: { required: requiredIf((form) => form.typeOfLocation.code === "camp") },
			number: { required: requiredIf((form) => form.typeOfLocation.code !== "camp") },
			street: { required: requiredIf((form) => form.typeOfLocation.code !== "camp") },
			postcode: { required: requiredIf((form) => form.typeOfLocation.code !== "camp") },
		},
	},

	async mounted() {
		await this.fetchLocationsTypes();
	},

	methods: {
		async fetchLocationsTypes() {
			this.locationTypesLoading = true;
			await BeneficiariesService.getListOfLocationsTypes()
				.then((result) => { this.options.typeOfLocation = result.data; })
				.catch((e) => {
					Notification(`Location Types ${e}`, "is-danger");
				});
			this.locationTypesLoading = false;
		},

		mapLocations() {
			if (this.formModel.type) {
				this.campSelected = this.formModel.type === "camp";
				this.formModel.typeOfLocation = this.options.typeOfLocation
					.find((item) => this.formModel.type === item.code);
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
