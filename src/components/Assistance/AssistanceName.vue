<template>
	<b-field
		class="name-field"
		:label="$t('Name of Assistance')"
		:type="validateType('name')"
		:message="validateMsg('name')"
	>
		<b-input
			v-model.trim="formModel.name"
			class="name-input"
			type="text"
			maxlength="80"
			:placeholder="$t('Will be generated')"
			:disabled="!isCustomLocal"
			@input="isValid"
		/>
		<p class="control">
			<b-field class="name-switch">
				<b-switch v-model="isCustomLocal">
					{{ $t("Custom") }}
				</b-switch>
			</b-field>
		</p>
	</b-field>
</template>

<script>
import { required } from "vuelidate/lib/validators";
import validation from "@/mixins/validation";

export default {
	name: "AssistanceName",

	mixins: [validation],

	props: {
		formModel: {
			type: Object,
			required: true,
		},
		isCustom: {
			type: Boolean,
			default: false,
		},
	},

	data() {
		return {
			isCustomLocal: this.isCustom,
		};
	},

	validations: {
		formModel: {
			name: { required },
		},
	},

	methods: {
		isValid() {
			this.validate("name");
			return !this.$v.$invalid;
		},
	},
};
</script>

<style lang="scss">
	.name-field {
		.name-input {
			width: 100%;
		}
		.name-switch {
			margin-left: 10px;
			margin-top: 5px;
		}
		.has-addons {
			height: 2.5em;
		}
	}
</style>
