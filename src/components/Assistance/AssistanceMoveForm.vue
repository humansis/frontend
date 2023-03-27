<template>
	<form>
		<section class="modal-card-body">
			<b-field
				:label="$t('Target project')"
				:type="validateType('newProject')"
				:message="validateMsg('newProject')"
			>
				<MultiSelect
					v-model="newProject"
					searchable
					label="name"
					track-by="id"
					:placeholder="$t('Click to select')"
					:options="projects"
				>
					<span slot="noOptions">{{ $t("List is empty")}}</span>
				</MultiSelect>
			</b-field>
		</section>
		<footer class="modal-card-foot">
			<b-button @click="closeForm">
				{{ $t('Close') }}
			</b-button>
			<b-button
				class="is-primary"
				@click="submitForm"
			>
				{{ $t('Move') }}
			</b-button>
		</footer>
	</form>
</template>

<script>
import { required } from "vuelidate/lib/validators";
import Validation from "@/mixins/validation";

export default {
	name: "AssistanceForm",

	mixins: [Validation],

	data() {
		return {
			newProject: null,
		};
	},

	props: {
		projects: {
			type: Array,
			default: () => [],
		},
	},

	validations: {
		newProject: { required },
	},

	methods: {
		submitForm() {
			this.$v.$touch();

			if (this.$v.$invalid) {
				return;
			}

			this.$emit("formSubmitted", this.newProject);
			this.closeForm();
		},

		closeForm() {
			this.$emit("formClosed");
			this.$v.$reset();
		},
	},
};
</script>
