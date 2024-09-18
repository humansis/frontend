<template>
	<v-container fluid>
		<Tabs :pre-selected-tab-value="ADMINISTRATIVE_SETTINGS.TABS_VALUE.ROLES" />

		<div class="d-flex justify-end">
			<v-btn
				:disabled="!isUserPermissionGranted(PERMISSIONS.ADMINISTRATIVE_SETTING_ROLE_MANAGEMENT)"
				:to="{ name: ROUTER.ROUTE_NAME.ROLES.ADD }"
				class="text-none ml-0 mb-3"
				color="primary"
				prepend-icon="plus"
			>
				{{ $t('Add') }}
			</v-btn>
		</div>

		<RolesList
			ref="rolesList"
			@delete="onRemoveRole"
			@showEdit="(id) => $router.push(this.getRoleEditPage(id))"
			@showDetail="(id) => $router.push(this.getRoleDetailPage(id))"
		/>
	</v-container>
</template>

<script>
import RolesService from "@/services/RolesService";
import RolesList from "@/components/AdministrativeSettings/Roles/List";
import Tabs from "@/components/AdministrativeSettings/Tabs";
import permissions from "@/mixins/permissions";
import routerHelper from "@/mixins/routerHelper";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";
import { ADMINISTRATIVE_SETTINGS, ROUTER } from "@/consts";

export default {
	name: "RolesPage",

	components: { RolesList, Tabs },

	mixins: [routerHelper, permissions],

	data() {
		return {
			ROUTER,
			ADMINISTRATIVE_SETTINGS,
		};
	},

	methods: {
		async onRemoveRole(id) {
			try {
				const {
					status,
					message,
				} = await RolesService.removeRole(id);

				checkResponseStatus(status, message, 204);

				Notification(this.$t("Role Successfully Deleted"), "success");
				this.$refs.rolesList.removeFromList(id);
			} catch (e) {
				Notification(`${this.$t("User")}: ${e.message || e}`, "error");
			}
		},
	},
};
</script>
