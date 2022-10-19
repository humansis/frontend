<template>
	<b-field
		class="name-field"
		:type="validateType('name')"
		:message="validateMsg('name')"
	>
		<b-input
			v-model.trim="formModel.name"
			class="name-input"
			type="text"
			:placeholder="$t('Will be generated')"
			:disabled="!isCustomLocal"
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
import Validation from "@/mixins/validation";

export default {
	name: "AssistanceName",

	mixins: [Validation],

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
			this.$v.$touch();
			return !this.$v.$invalid;
		},
	},
};
</script>

<style lang="scss" scoped>
	.name-input {
		width: 100%;
	}
	.name-switch {
		margin-left: 10px;
		margin-top: 5px;
	}
</style>
