<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field
				:label="$t('Title')"
				:type="validateType('title')"
				:message="validateMsg('title')"
			>
				<b-input
					v-model="formModel.title"
					:disabled="formDisabled"
					@blur="validate('title')"
				/>
			</b-field>

			<MultiSelectWithLabel
				v-model="formModel.projects"
				name="projects"
				label="Projects"
				validated-field-name="projects"
				variable-to-show="name"
				track-by="id"
				searchable
				multiple
				add-select-all
				select-all-label="All projects"
				:validation="getValidations"
				:loading="projectsLoading"
				:options="options.projects"
				:disabled="formDisabled"
			/>

			<b-field
				:label="$t('Description')"
				:type="validateType('description')"
				:message="validateMsg('description')"
			>
				<b-input
					v-model="formModel.description"
					type="textarea"
					maxlength="255"
					:disabled="formDisabled"
					@blur="validate('description')"
				/>
			</b-field>
		</section>
		<footer class="modal-card-foot">
			<b-button v-if="closeButton" @click="closeForm">
				{{ $t('Close') }}
			</b-button>
			<b-button
				v-if="!formDisabled"
				type="is-primary"
				native-type="submit"
			>
				{{ $t(submitButtonLabel) }}
			</b-button>
		</footer>
	</form>
</template>

<script>
import { required } from "vuelidate/lib/validators";
import validation from "@/mixins/validation";
import MultiSelectWithLabel from "@/components/Inputs/MultiSelectWithLabel";

export default {
	name: "importForm",

	components: {
		MultiSelectWithLabel,
	},

	mixins: [validation],

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
		formDisabled: Boolean,
		isEditing: Boolean,
		options: {
			type: Object,
			default: () => {},
		},
	},

	data() {
		return {
			projectsLoading: false,
		};
	},

	validations: {
		formModel: {
			title: { required },
			projects: { required },
			description: {},
		},
	},

	computed: {
		getValidations() {
			return this.$v;
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
