export default {
	methods: {
		validate(fieldName) {
			this.$v.formModel[fieldName].$touch();
		},

		validateMsg(fieldName, message) {
			return this.$v.formModel[fieldName].$error ? message : "";
		},

		validateType(fieldName) {
			let result = "";
			if (this.$v.formModel[fieldName].$dirty) {
				result = this.$v.formModel[fieldName].$error ? "is-danger" : "is-success";
			}
			return result;
		},
	},
};
