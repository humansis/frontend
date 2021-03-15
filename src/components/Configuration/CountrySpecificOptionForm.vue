<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field
				label="Field"
				:type="validateType('field')"
				:message="validateMsg('field')"
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
				:message="validateMsg('type')"
			>
				<MultiSelect
					v-model="formModel.type"
					searchable
					is-relative
					label="value"
					track-by="code"
					placeholder="Click to select..."
					:disabled="formDisabled"
					:options="options.types"
					:class="validateMultiselect('type')"
					@select="validate('type')"
				/>
			</b-field>

			<b-field
				label="Target"
				:type="validateType('target')"
				:message="validateMsg('target')"
			>
				<MultiSelect
					v-model="formModel.target"
					searchable
					is-relative
					label="value"
					track-by="code"
					placeholder="Click to select..."
					:disabled="formDisabled"
					:options="options.targets"
					:loading="loadingTargets"
					:class="validateMultiselect('target')"
					@select="validate('target')"
				/>
			</b-field>
		</section>
		<section class="modal-card-foot">
			<b-button
				v-if="closeButton"
				@click="closeForm"
			>
				Close
			</b-button>
			<b-button
				v-if="!formDisabled"
				tag="input"
				class="is-primary"
				native-type="submit"
				:value="submitButtonLabel"
			/>
		</section>
	</form>
</template>

<script>
import { required } from "vuelidate/lib/validators";
import AssistancesService from "@/services/AssistancesService";
import { Notification } from "@/utils/UI";
import Validation from "@/mixins/validation";

export default {
	name: "CountrySpecificOptionForm",

	mixins: [Validation],

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
		formDisabled: Boolean,
	},

	data() {
		return {
			options: {
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
			},
			loadingTargets: true,
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
		this.mapSelects();
	},

	methods: {
		mapSelects() {
			this.formModel.type = this.options.types.find((item) => item.code === this.formModel.type);
		},

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

		async fetchTargets() {
			await AssistancesService.getTargetTypes()
				.then((response) => { this.options.targets = response.data; })
				.catch((e) => {
					Notification(`Target Types ${e}`, "is-danger");
				});

			this.formModel.target = this.options.targets
				.find((item) => item.code === this.formModel.target);
			this.loadingTargets = false;
		},
	},
};
</script>
