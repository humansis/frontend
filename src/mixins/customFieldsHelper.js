export default {
	methods: {
		prepareCustomFields(answers) {
			const preparedAnswers = {};

			if (!answers) return preparedAnswers;

			answers.forEach(({ answer, countrySpecificId }) => {
				preparedAnswers[countrySpecificId] = answer;
			});

			return preparedAnswers;
		},
	},
}
