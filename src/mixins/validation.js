export default {
	methods: {
		validate(fieldName) {
			const validation = this.validationPropertyLevel(fieldName);
			validation.$touch();
		},

		validateMsg(fieldName, message = "Required") {
			const validation = this.validationPropertyLevel(fieldName);
			return validation.$error ? this.$root.$i18n.t(message) : "";
		},

		validateType(fieldName) {
			const validation = this.validationPropertyLevel(fieldName);

			let result = "";
			if (validation.$dirty) {
				result = validation.$error ? "is-danger" : "is-success";
			}

			return result;
		},

		validateMultiselect(fieldName) {
			const validation = this.validationPropertyLevel(fieldName);

			let result = "";
			if (validation.$dirty) {
				result = validation.$error ? "vue-multiselect-error" : "vue-multiselect-success";
			}
			return result;
		},

		validationPropertyLevel(fields) {
			let result;
			const fieldsLevel = fields.split(".");

			switch (fieldsLevel.length) {
				case 1:
					result = this.$v.formModel[fieldsLevel[0]];
					break;
				case 2:
					result = this.$v.formModel[fieldsLevel[0]][fieldsLevel[1]];
					break;
				case 3:
					result = this.$v.formModel[fieldsLevel[0]][fieldsLevel[1]][fieldsLevel[2]];
					break;
				default:
			}
			return result;
		},
	},
};
