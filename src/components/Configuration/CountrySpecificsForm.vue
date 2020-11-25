<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field
				label="Field"
				:type="validateType('field')"
				:message="validateMsg('field', 'Required')"
			>
				<b-input
					v-model="formModel.field"
					:disabled="formDisabled"
					@blur="validate('field')"
				/>
			</b-field>

			<b-field
				label="Type"
				:type="validateType('type')"
				:message="validateMsg('type', 'Required')"
			>
				<MultiSelect
					v-model="formModel.type"
					searchable
					is-relative
					label="name"
					track-by="id"
					:disabled="formDisabled"
					:options="types"
					@select="validate('type')"
				/>
			</b-field>

			<b-field
				label="Target"
				:type="validateType('target')"
				:message="validateMsg('target', 'Required')"
			>
				<MultiSelect
					v-model="formModel.target"
					searchable
					is-relative
					label="name"
					track-by="id"
					:disabled="formDisabled"
					:options="targets"
					@select="validate('target')"
				/>
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
	name: "CountrySpecificsForm",

	mixins: [Validation],

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
		formDisabled: Boolean,
	},

	data() {
		return {
			types: [
				{
					id: "number",
					name: "Number",
				},
				{
					id: "text",
					name: "Text",
				},
			],
			targets: [
				{
					id: 0,
					name: "Vendor",
				},
				{
					id: 1,
					name: "Household",
				},
				{
					id: 2,
					name: "Institution",
				},
			],
		};
	},

	validations: {
		formModel: {
			field: {
				required,
			},
			type: {
				required,
			},
			target: {
				required,
			},
		},
	},

	methods: {
		submitForm() {
			this.$v.$touch();
			if (this.$v.$invalid) {
				return;
			}

			this.$emit("formSubmitted", this.formModel);
			this.$v.$reset();
		},

		closeForm() {
			this.$emit("formClosed");
			this.$v.$reset();
		},
	},
};
</script>
