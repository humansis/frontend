<template>
	<v-container fluid>
		<div class="d-flex mb-4">
			<h2 class="me-auto" data-cy="page-title-text">{{ $t('Institutions') }}</h2>

			<v-btn
				:disabled="!isUserPermissionGranted(PERMISSIONS.INSTITUTION_CREATE)"
				:to="{ name: ROUTER.ROUTE_NAME.INSTITUTIONS.ADD }"
				color="primary"
				prepend-icon="plus"
				class="text-none ml-0"
			>
				{{ $t('Add') }}
			</v-btn>
		</div>

		<InstitutionsList
			ref="institutionsList"
			@delete="onRemoveInstitution"
			@showEdit="(id) => $router.push(this.getInstitutionEditPage(id))"
			@showDetail="(id) => $router.push(this.getInstitutionDetailPage(id))"
		/>
	</v-container>
</template>

<script>
import InstitutionService from "@/services/InstitutionService";
import InstitutionsList from "@/components/Beneficiaries/InstitutionsList";
import permissions from "@/mixins/permissions";
import routerHelper from "@/mixins/routerHelper";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";
import { ROUTER } from "@/consts";

export default {
	name: "InstitutionPage",

	components: {
		InstitutionsList,
	},

	mixins: [permissions, routerHelper],

	data() {
		return {
			ROUTER,
		};
	},

	methods: {
		async onRemoveInstitution(id) {
			try {
				const {
					status,
					message,
				} = await InstitutionService.deleteInstitution(id);

				checkResponseStatus(status, message, 204);

				Notification(this.$t("Institution Successfully Deleted"), "success");

				this.$refs.institutionsList.removeFromList(id);
				this.$refs.institutionsList.table.total -= 1;
			} catch (e) {
				Notification(`${this.$t("Institution")}: ${e.message || e}`, "error");
			}
		},
	},
};
</script>
