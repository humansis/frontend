<template>
	<v-container fluid>
		<Tabs :pre-selected-tab-value="ADMINISTRATIVE_SETTINGS.TABS_VALUE.USERS" />

		<div class="d-flex justify-end">
			<v-btn
				:disabled="!isUserPermissionGranted(PERMISSIONS.INSTITUTION_CREATE)"
				:to="{ name: ROUTER.ROUTE_NAME.USERS.ADD }"
				class="text-none ml-0 mb-3"
				color="primary"
				prepend-icon="plus"
			>
				{{ $t('Add') }}
			</v-btn>
		</div>

		<UsersList
			ref="usersList"
			@delete="onRemoveUser"
			@showEdit="({ id }) => $router.push(this.getUserEditPage(id))"
			@showDetail="({ id }) => $router.push(this.getUserDetailPage(id))"
		/>
	</v-container>
</template>

<script>
import UsersService from "@/services/UsersService";
import Tabs from "@/components/AdministrativeSettings/Tabs";
import UsersList from "@/components/AdministrativeSettings/Users/List";
import permissions from "@/mixins/permissions";
import routerHelper from "@/mixins/routerHelper";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";
import { ADMINISTRATIVE_SETTINGS, ROUTER } from "@/consts";

export default {
	name: "UsersPage",

	components: {
		UsersList,
		Tabs,
	},

	mixins: [permissions, routerHelper],

	data() {
		return {
			ADMINISTRATIVE_SETTINGS,
			ROUTER,
		};
	},

	methods: {
		async onRemoveUser(id) {
			try {
				const {
					status,
					message,
				} = await UsersService.deleteUser(id);

				checkResponseStatus(status, message, 204);

				Notification(this.$t("User Successfully Deleted"), "success");
				this.$refs.usersList.removeFromList(id);
			} catch (e) {
				Notification(`${this.$t("User")}: ${e.message || e}`, "error");
			}
		},
	},
};
</script>
