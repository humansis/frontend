<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field
				label="Name"
				:type="getValidationType('name')"
				:message="getValidationMessage('name', 'Required')"
			>
				<b-input
					v-model="formModel.name"
					placeholder="Name"
					:disabled="formDisabled"
					@blur="validateInput('name')"
				/>
			</b-field>

			<b-field
				label="Iso 3"
				:type="getValidationType('iso3')"
				:message="getValidationMessage('iso3', 'Required')"
			>
				<b-input
					v-model="formModel.iso3"
					placeholder="Short Name"
					:disabled="formDisabled"
					@blur="validateInput('iso3')"
				/>
			</b-field>

			<b-field
				label="Available Currencies"
				:type="getValidationType('availableCurrencies')"
			>
				<MultiSelect
					v-model="formModel.availableCurrencies"
					multiple
					searchable
					placeholder="Available Currencies"
					label="name"
					track-by="id"
					:disabled="formDisabled"
					:options="currencies"
				/>
			</b-field>

			<b-field
				label="Country Flag"
				:type="getValidationType('countryFlag')"
				:message="getValidationMessage('countryFlag', 'Required')"
			>
				<MultiSelect
					v-model="formModel.countryFlag"
					searchable
					placeholder="Country Flag"
					label="name"
					track-by="id"
					:disabled="formDisabled"
					:options="flags"
				>
					<template slot="singleLabel" slot-scope="props">
						<CountryFlag :country="props.option.id" size="normal" />
						<span class="option__desc ml-2">
							<span class="option__title">{{ props.option.name }}</span>
						</span>
					</template>

					<template slot="option" slot-scope="props">
						<CountryFlag :country="props.option.id" size="normal" />
						<div class="option__desc">
							<span class="option__title">{{ props.option.name }}</span>
						</div>
					</template>
				</MultiSelect>
			</b-field>

		</section>

		<footer class="modal-card-foot">
			<button
				v-if="closeButton"
				class="button"
				type="button"
				@click="closeForm"
			>
				Close
			</button>
			<b-button
				v-if="!formDisabled"
				tag="input"
				class="is-success"
				native-type="submit"
				:value="submitButtonLabel"
			/>
		</footer>
	</form>
</template>

<script>
import { required } from "vuelidate/lib/validators";

export default {
	name: "CountryForm",

	data() {
		return {
			uploadedImage: null,
			flags: [
				{
					id: "khm",
					name: "KHM",
				},
				{
					id: "syr",
					name: "SYR",
				},
				{
					id: "ukr",
					name: "UKR",
				},
			],
			currencies: [
				{
					id: "eur",
					name: "EURO",
				},
				{
					id: "usd",
					name: "USD",
				},
				{
					id: "czk",
					name: "CZK",
				},
				{
					id: "gpd",
					name: "GPD",
				},
			],
		};
	},

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
		formDisabled: Boolean,
	},

	validations: {
		formModel: {
			name: {
				required,
			},
			iso3: {
				required,
			},
			availableCurrencies: {
				required,
			},
			countryFlag: {
				required,
			},
		},
	},

	mounted() {
		this.prepareFlags();
	},

	methods: {
		submitForm() {
			this.formModel.logo = this.uploadedImage;
			this.$v.$touch();
			if (this.$v.$invalid) {
				return;
			}

			this.$emit("formSubmitted", this.formModel);
			this.$v.$reset();
		},

		validateInput(fieldName) {
			this.$v.formModel[fieldName].$touch();
		},

		getValidationMessage(fieldName, message) {
			return this.$v.formModel[fieldName].$error ? message : "";
		},

		getValidationType(fieldName) {
			let result = "";
			if (this.$v.formModel[fieldName].$dirty) {
				result = this.$v.formModel[fieldName].$error ? "is-danger" : "is-success";
			}
			return result;
		},

		prepareFlags() {
		},

		closeForm() {
			this.$emit("formClosed");
			this.$v.$reset();
		},
	},
};
</script>
