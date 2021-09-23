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
			<b-field
				:label="$t('Project')"
				:type="validateType('project')"
				:message="validateMsg('project')"
			>
				<MultiSelect
					v-model="formModel.project"
					searchable
					label="name"
					track-by="id"
					:placeholder="$t('Click to select')"
					:loading="projectsLoading"
					:disabled="formDisabled || isEditing"
					:options="options.projects"
					:class="validateMultiselect('project')"
					@select="validate('project')"
				/>
			</b-field>

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
				tag="input"
				type="is-primary"
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
	name: "importForm",

	mixins: [Validation],

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
			project: { required },
			description: {},
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
