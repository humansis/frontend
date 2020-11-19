<!-- TODO edit after real api-->
<template>
	<div>

		<Modal
			can-cancel
			:active="organizationServiceModal.isOpened"
			:header="modalHeader"
			@close="closeOrganizationServiceModal"
		>
			<OrganizationServiceForm
				close-button
				submit-button-label="Create"
				:formModel="organizationServiceModel"
				:form-disabled="organizationServiceModal.isDetail"
				@formSubmitted="submitOrganizationServiceForm"
				@formClosed="closeOrganizationServiceModal"
			/>
		</Modal>

		<div class="columns">
			<div class="column is-two-fifths">
				<b-field>
					<b-input placeholder="Search..."
						type="search"
						icon="search"
					/>
				</b-field>
			</div>
		</div>

		<Table
			:data="table.data"
			:total="table.total"
			:current-page="table.currentPage"
			:per-page="table.perPage"
			@clicked="showDetail"
			@pageChanged="onPageChange"
			@sorted="onSort"
		>
			<template v-for="column in table.columns">
				<b-table-column v-bind="column" :key="column.id">
					<template v-slot="props">
						{{ props.row[column.field] }}
					</template>
				</b-table-column>
			</template>

			<b-table-column
				v-slot="props"
				label="Actions"
			>
				<div class="block">
					<ActionButton
						icon="search"
						type="is-info"
						@click.native="showDetailWithId(props.row.id)"
					/>
					<ActionButton
						icon="edit"
						type="is-link"
						@click.native="editOrganizationService(props.row.id)"
					/>
				</div>
			</b-table-column>

		</Table>
	</div>
</template>

<script>
import Table from "@/components/Table";
import ActionButton from "@/components/ActionButton";
import { generateColumns } from "@/utils/datagrid";
import OrganizationServicesService from "@/services/OrganizationServicesService";
import { Toast } from "@/utils/UI";
import OrganizationServiceForm from "@/components/AdministrativeSettings/OrganizationServiceForm";
import Modal from "@/components/Modal";

export default {
	name: "OrganizationServicesList",

	components: {
		Modal,
		OrganizationServiceForm,
		Table,
		ActionButton,
	},

	data() {
		return {
			fetch: {
				error: null,
			},
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{
						key: "name",
						label: "Service Name",
					},
					{
						key: "country",
						label: "Country",
					},
					{
						key: "enabled",
						label: "Enabled",
					},
				],
				total: 0,
				currentPage: 1,
				perPage: 15,
			},
			organizationServiceModal: {
				isOpened: false,
				isEditing: false,
				isDetail: false,
			},
			organizationServiceModel: {
				id: null,
				name: null,
				enabled: false,
				password: null,
				username: null,
				token: null,
				email: null,
				production: false,
				country: null,
			},
		};
	},

	watch: {
		$route: "fetchData",
	},

	computed: {
		modalHeader() {
			let result = "";
			if (this.organizationServiceModal.isDetail) {
				result = "Detail of Organization Service";
			} else if (this.organizationServiceModal.isEditing) {
				result = "Update new OrganizationService";
			}
			return result;
		},
	},

	mounted() {
		this.fetchData();
	},

	methods: {
		async fetchData() {
			try {
				this.fetch.error = null;
				const loadingComponent = this.$buefy.loading.open();

				await OrganizationServicesService.getListOfOrganizationServices(
					this.table.currentPage,
					this.table.perPage,
					"desc",
				).then((response) => {
					this.table.data = this.prepareDataForTable(response.data);
					this.table.total = response.totalCount;
					this.table.columns = generateColumns(
						this.table.visibleColumns,
					);
				});

				loadingComponent.close();
			} catch (error) {
				this.handleError(error);
			}
		},

		prepareDataForTable(data) {
			const preparedData = [];
			data.forEach((value) => {
				this.mapToFormModel(value);
				preparedData.push(this.organizationServiceModel);
			});
			return preparedData;
		},

		handleError(error) {
			console.error(error);
			this.fetch.loading = false;
			this.fetch.error = error.toString();
		},

		showDetailWithId(id) {
			const organizationService = this.table.data.find((item) => item.id === id);
			this.showDetail(organizationService);
		},

		showDetail(organizationService) {
			this.organizationServiceModel = organizationService;
			this.organizationServiceModal = {
				isEditing: false,
				isOpened: true,
				isDetail: true,
			};
		},

		mapToFormModel(
			{
				id,
				enabled,
				parametersValue,
				service,
			},
		) {
			this.organizationServiceModel = {
				...this.organizationServiceModel,
				id,
				enabled,
				password: parametersValue.password,
				username: parametersValue.username,
				token: parametersValue.token,
				email: parametersValue.email,
				production: parametersValue.production,
				country: service.country,
				name: service.name,
			};
		},

		closeOrganizationServiceModal() {
			this.organizationServiceModal.isOpened = false;
		},

		editOrganizationService(id) {
			this.organizationServiceModal = {
				isEditing: true,
				isOpened: true,
				isDetail: false,
			};

			this.organizationServiceModel = this.table.data.find((item) => item.id === id);
		},

		submitOrganizationServiceForm(organizationServiceForm) {
			const {
				id,
				enabled,
				password,
				username,
				token,
				email,
				production,
			} = organizationServiceForm;

			const organizationServiceBody = {
				enabled,
				password,
				username,
				token,
				email,
				production,
			};

			this.updateOrganizationService(organizationServiceBody, id);

			this.closeOrganizationServiceModal();
		},

		async updateOrganizationService(organizationServiceBody) {
			await OrganizationServicesService.updateOrganizationService(organizationServiceBody)
				.then((response) => {
					if (response.status === 200) {
						Toast("Organization Service Successfully Created", "is-success");
						this.fetchData();
					}
				});
		},

		onPageChange() {
			// TODO on table page change
		},

		onSort() {
			// TODO on table sort
		},
	},
};
</script>
