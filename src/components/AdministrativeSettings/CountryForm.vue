<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field
				label="Name"
				:type="validateType('name')"
				:message="validateMsg('name')"
			>
				<b-input
					v-model="formModel.name"
					:disabled="formDisabled"
					@blur="validate('name')"
				/>
			</b-field>

			<b-field
				label="Iso 3"
				:type="validateType('iso3')"
				:message="validateMsg('iso3')"
			>
				<b-input
					v-model="formModel.iso3"
					:disabled="formDisabled"
					@blur="validate('iso3')"
				/>
			</b-field>

			<b-field
				label="Available Currencies"
				:type="validateType('availableCurrencies')"
			>
				<MultiSelect
					v-model="formModel.availableCurrencies"
					multiple
					searchable
					label="value"
					track-by="code"
					:disabled="formDisabled"
					:class="validateMultiselect('availableCurrencies')"
					:options="currencies"
					@select="validate('availableCurrencies')"
				/>
			</b-field>

			<b-field
				label="Country Flag"
				:type="validateType('countryFlag')"
				:message="validateMsg('countryFlag')"
			>
				<MultiSelect
					v-model="formModel.countryFlag"
					searchable
					label="value"
					track-by="code"
					:disabled="formDisabled"
					:options="flags"
					:class="validateMultiselect('countryFlag')"
					@select="validate('countryFlag')"
				>
					<template slot="singleLabel" slot-scope="props">
						<CountryFlag :country="props.option.code" size="normal" />
						<span class="option__desc ml-2">
							<span class="option__title">{{ props.option.value }}</span>
						</span>
					</template>
					<template slot="option" slot-scope="props">
						<CountryFlag :country="props.option.code" size="normal" />
						<div class="option__desc">
							<span class="option__title">{{ props.option.value }}</span>
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
import Validation from "@/mixins/validation";

export default {
	name: "CountryForm",

	mixins: [Validation],

	data() {
		return {
			uploadedImage: null,
			flags: [
				{ code: "khm", value: "KHM" },
				{ code: "syr", value: "SYR" },
				{ code: "ukr", value: "UKR" },
			],
			currencies: [
				{ code: "eur", value: "EUR" },
				{ code: "usd", value: "USD" },
				{ code: "czk", value: "CZK" },
				{ code: "gpd", value: "GPD" },
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
			name: { required },
			iso3: { required },
			availableCurrencies: { required },
			countryFlag: { required },
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

		prepareFlags() {
		},

		closeForm() {
			this.$emit("formClosed");
			this.$v.$reset();
		},
	},
};
</script>
