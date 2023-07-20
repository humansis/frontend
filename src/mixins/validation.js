import i18n from "@/plugins/i18n";

export default {
	methods: {
		getValidation(field, object = "formModel") {
			return typeof field === "string" ? this.validationPropertyLevel(field, object) : field;
		},

		validate(field, object) {
			const validation = this.getValidation(field, object);
			validation.$touch();
		},

		validateMsg(field, message = i18n.t("Required"), object) {
			const validation = this.getValidation(field, object);

			if (Object.keys(validation).includes("maxLength")
				&& validation.$error && !validation.maxLength) {
				return i18n.t("Too long! (max. 255 characters)");
			}
			return validation.$error ? i18n.t(message) : "";
		},

		validateType(field, errorOrNothing = false, object) {
			const validation = this.getValidation(field, object);

			let result = "";
			if (validation.$dirty) {
				if (errorOrNothing) {
					result = validation.$error ? "is-danger" : "";
				} else {
					result = validation.$error ? "is-danger" : "is-success";
				}
			}

			return result;
		},

		validateMultiselect(field, errorOrNothing = false, object) {
			const validation = this.getValidation(field, object);

			let result = "";
			if (validation.$dirty) {
				if (errorOrNothing) {
					result = validation.$error ? "vue-multiselect-error" : "";
				} else {
					result = validation.$error ? "vue-multiselect-error" : "vue-multiselect-success";
				}
			}
			return result;
		},

		validationPropertyLevel(fields, object) {
			let result;
			const fieldsLevel = fields.split(".");
			if (!this.$v[object]) {
				return this.$v[fieldsLevel[0]];
			}

			switch (fieldsLevel.length) {
				case 1:
					result = this.$v[object][fieldsLevel[0]];
					break;
				case 2:
					result = this.$v[object][fieldsLevel[0]][fieldsLevel[1]];
					break;
				case 3:
					result = this.$v[object][fieldsLevel[0]][fieldsLevel[1]][fieldsLevel[2]];
					break;
				default:
			}
			return result;
		},
	},
};
