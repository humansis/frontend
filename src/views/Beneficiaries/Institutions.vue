<template>
	<v-container fluid>
		<div class="d-flex mb-4">
			<h2 class="me-auto">{{ $t('Institutions') }}</h2>

			<v-btn
				v-if="userCan.addBeneficiary"
				:to="{ name: 'AddInstitution' }"
				color="primary"
				size="small"
				prepend-icon="plus"
				class="text-none ml-0"
			>
				{{ $t('Add') }}
			</v-btn>
		</div>

		<InstitutionsList
			ref="institutionsList"
			@onDelete="removeInstitution"
			@showEdit="editInstitution"
			@showDetail="showDetail"
		/>
	</v-container>
</template>

<script>
import InstitutionService from "@/services/InstitutionService";
import InstitutionsList from "@/components/Beneficiaries/InstitutionsList";
import permissions from "@/mixins/permissions";
import { Notification } from "@/utils/UI";

export default {
	name: "InstitutionPage",

	components: {
		InstitutionsList,
	},

	mixins: [permissions],

	methods: {
		editInstitution(id) {
			this.$router.push({
				name: "InstitutionEdit",
				params: { institutionId: id },
			});
		},

		showDetail(id) {
			this.$router.push({
				name: "InstitutionDetail",
				params: { institutionId: id },
			});
		},

		async removeInstitution(id) {
			try {
				const { status } = await InstitutionService.deleteInstitution(id);

				if (status === 204) {
					Notification(this.$t("Institution Successfully Deleted"), "success");

					this.$refs.institutionsList.removeFromList(id);
					this.$refs.institutionsList.table.total -= 1;
				}
			} catch (e) {
				Notification(`${this.$t("Institution")} ${e.message || e}`, "error");
			}
		},
	},
};
</script>
