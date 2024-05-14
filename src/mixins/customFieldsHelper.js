import CustomFieldsService from "@/services/CustomFieldsService";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";

export default {
	methods: {
		async fetchCustomFields() {
			try {
				const {
					data: { data },
					status,
					message,
				} = await CustomFieldsService.getListOfCustomFields({
					sort: "label.asc",
					filters: this.customFieldsTarget,
				});

				checkResponseStatus(status, message);

				this.customFieldsList = data;
			} catch (e) {
				Notification(`${this.$t("Custom Fields")}: ${e.message || e}`, "error");
			}
		},

		prepareCustomFieldValues(values, customFields) {
			const preparedValues = {};

			if (!values) return preparedValues;

			values.forEach(({ key, value }) => {
				const customFieldID = customFields.find((customField) => customField.key === key)?.id;

				if (customFieldID) {
					preparedValues[customFieldID] = value;
				}
			});

			return preparedValues;
		},
	},
};
