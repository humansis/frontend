<template>
	<div>
		<div class="level">
			<div class="level-left">
				<h1 class="title">{{ $t('Institutions') }}</h1>
			</div>

			<div class="level-right">
				<b-button
					v-if="userCan.addBeneficiary"
					type="is-primary"
					icon-left="plus"
					@click="addNewInstitution"
				>
					{{ $t('Add') }}
				</b-button>
			</div>
		</div>

		<InstitutionsList
			ref="institutionsList"
			@remove="removeInstitution"
			@showEdit="editInstitution"
			@showDetail="showDetail"
		/>
	</div>
</template>

<script>
import InstitutionsList from "@/components/Beneficiaries/InstitutionsList";
import permissions from "@/mixins/permissions";
import InstitutionService from "@/services/InstitutionService";
import { Toast } from "@/utils/UI";

export default {
	name: "InstitutionPage",

	components: {
		InstitutionsList,
	},

	mixins: [permissions],

	methods: {
		addNewInstitution() {
			this.$router.push({ name: "AddInstitution" });
		},

		editInstitution(institution) {
			this.$router.push({
				name: "InstitutionEdit",
				params: { institutionId: institution.id },
			});
		},

		showDetail(institution) {
			this.$router.push({
				name: "InstitutionDetail",
				params: { institutionId: institution.id },
			});
		},

		async removeInstitution(id) {
			try {
				const { status } = await InstitutionService.deleteInstitution(id);

				if (status === 204) {
					Toast(this.$t("Institution Successfully Deleted"), "is-success");
					this.$refs.institutionsList.removeFromList(id);
					this.$refs.institutionsList.table.total -= 1;
				}
			} catch (e) {
				Toast(`${this.$t("Institution")} ${e.message || e}`, "is-danger");
			}
		},
	},
};
</script>
