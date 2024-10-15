<template>
	<v-container fluid>
		<div class="d-flex mb-4">
			<h2 class="me-auto" data-cy="page-title-text">{{ $t('Institutions') }}</h2>

			<ButtonAction
				:required-permissions="PERMISSIONS.INSTITUTION_CREATE"
				:to="{ name: ROUTER.ROUTE_NAME.INSTITUTIONS.ADD }"
				:is-only-icon="false"
				color="primary"
				icon="plus"
				label="Add"
			/>
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
import ButtonAction from "@/components/ButtonAction";
import permissions from "@/mixins/permissions";
import routerHelper from "@/mixins/routerHelper";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";
import { ROUTER } from "@/consts";

export default {
	name: "InstitutionPage",

	components: {
		ButtonAction,
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
