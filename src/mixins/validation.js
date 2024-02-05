import { useVuelidate } from "@vuelidate/core";

export default {
	data() {
		return {
			v$: useVuelidate(),
		};
	},

	methods: {
		getValidation(field, object = "formModel") {
			return field.length
				? this.validationPropertyLevel(field, object)
				: console.error("First parameter must be name of the validated field");
		},

		onValidate(field, object) {
			const validation = this.getValidation(field, object);
			validation.$touch();
		},

		validationPropertyLevel(fields, object) {
			let result;
			const fieldsLevel = fields.split(".");

			if (!this.v$[object]) {
				return this.v$[fieldsLevel[0]];
			}

			switch (fieldsLevel.length) {
				case 1:
					result = this.v$[object][fieldsLevel[0]];
					break;

				case 2:
					result = this.v$[object][fieldsLevel[0]][fieldsLevel[1]];
					break;

				case 3:
					result = this.v$[object][fieldsLevel[0]][fieldsLevel[1]][fieldsLevel[2]];
					break;

				default:
					break;
			}

			return result;
		},

		validationMsg(field, object = "formModel") {
			const validation = this.getValidation(field, object);

			if (Object.keys(validation).includes("required")
				&& validation.required.$invalid
				&& validation.$errors[0]) {
				return this.$t("This value is required");
			}

			if (Object.keys(validation).includes("minValue")
				&& validation.minValue.$invalid
				&& validation.$errors[0]) {
				return this.$t(validation?.$errors[0]?.$message);
			}

			if (Object.keys(validation).includes("passwordValidation")
				&& validation.passwordValidation.$invalid && validation.$errors[0]) {
				return this.$t("The Password Is Not Strong Enough… "
					+ "Minimum Required = 8 Characters, 1 Lowercase, 1 Uppercase, 1 Numeric");
			}

			if (Object.keys(validation).includes("sameAsPassword")
				&& validation.sameAsPassword.$invalid && validation.$errors[0]) {
				return this.$t("Passwords must be same");
			}

			return validation?.$error ? this.$t(validation?.$errors[0]?.$message) : "";
		},
	},
};
