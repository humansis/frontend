import ApprovalService from "@/services/ApprovalService";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";

export default {
	methods: {
		async fetchListOfApprovals({ filters }) {
			try {
				const {
					data: { data },
					status,
					message,
				} = await ApprovalService.getListOfApprovals({ filters });

				checkResponseStatus(status, message);

				return data;
			} catch (e) {
				Notification(`${this.$t("Approvals")}: ${e.message || e}`, "error");
			}

			return [];
		},

		findApprovalByConditions(conditionsObject) {
			return this.approvalsList.find(
				(approval) => Object.keys(conditionsObject)
					.every((key) => approval[key] === conditionsObject[key]),
			);
		},
	},
};
