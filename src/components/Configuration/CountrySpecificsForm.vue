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
					label="value"
					track-by="code"
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
					label="value"
					track-by="code"
					:disabled="formDisabled"
					:options="targets"
					@select="validate('target')"
				/>
			</b-field>
		</section>
		<section class="modal-card-foot">
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
		</section>
	</form>
</template>

<script>
import { Toast } from "@/utils/UI";
import { required } from "vuelidate/lib/validators";
import Validation from "@/mixins/validation";
import AssistancesService from "@/services/AssistancesService";

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
					code: "number",
					value: "Number",
				},
				{
					code: "text",
					value: "Text",
				},
			],
			targets: [],
		};
	},

	validations: {
		formModel: {
			field: { required },
			type: { required },
			target: { required },
		},
	},

	mounted() {
		this.fetchTargets();
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

		fetchTargets() {
			AssistancesService.getListOfTargetsForAssistances()
				.then((response) => { this.targets = response.data; })
				.catch((e) => {
					Toast(`(Target Types) ${e}`, "is-danger");
				});
		},
	},
};
</script>
