import { PERMISSIONS } from "@/consts";
import getters from "@/store/getters";

export const isUserPermissionGranted = (requiredPermissions) => {
	if (typeof requiredPermissions !== "string" && !Array.isArray(requiredPermissions)) return [];

	const userPermissions = getters.getUserPermissionsFromVuexStorage();
	const arrayWithRequiredPermissions = Array.isArray(requiredPermissions)
		? requiredPermissions
		: [requiredPermissions];

	return arrayWithRequiredPermissions.every((permission) => userPermissions?.[permission]);
};

export default {
	isUserPermissionGranted,
	PERMISSIONS,
};
