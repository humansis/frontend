import { isUserPermissionGranted } from "@/utils/permissions";
import { PERMISSIONS } from "@/consts";

export default {
	data() {
		return {
			PERMISSIONS,
		};
	},

	methods: {
		isUserPermissionGranted(permissions) {
			return isUserPermissionGranted(permissions);
		},
	},
};
