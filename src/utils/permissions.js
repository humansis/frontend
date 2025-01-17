import getters from "@/store/getters";

export const isUserPermissionGranted = (
	requiredPermissions,
	isAtLeastOnePermissionGranted = false,
) => {
	if (typeof requiredPermissions !== "string" && !Array.isArray(requiredPermissions)) return [];

	const userPermissions = getters.getUserPermissionsFromVuexStorage();
	const arrayWithRequiredPermissions = Array.isArray(requiredPermissions)
		? requiredPermissions
		: [requiredPermissions];

	return isAtLeastOnePermissionGranted
		? arrayWithRequiredPermissions.some((permission) => userPermissions?.[permission])
		: arrayWithRequiredPermissions.every((permission) => userPermissions?.[permission]);
};

export default {
	isUserPermissionGranted,
};
