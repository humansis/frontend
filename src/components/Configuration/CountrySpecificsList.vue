<template>
	<div>
		<h2 class="title">Country Specific Options</h2>

		<Modal
			:active="countrySpecificsModal.isOpened"
			:can-cancel="true"
			:header="modalHeader"
			@close="closeCountrySpecificsModal"
		>
			<CountrySpecificsForm
				close-button
				:formModel="countrySpecificsModel"
				:submit-button-label="'Create'"
				:form-disabled="countrySpecificsModal.isDetail"
				@formSubmitted="submitCountrySpecificsForm"
				@formClosed="closeCountrySpecificsModal"
			/>
		</Modal>
		<b-button
			class="mb-5"
			size="is-medium"
			type="is-danger"
			icon-left="plus"
			@click="addNewCountrySpecifics"
		>
			Add
		</b-button>
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
					<SafeDelete
						icon="trash"
						entity="Country Specifics"
						:id="props.row.id"
						@submitted="onRemoveCountrySpecifics"
					/>
				</div>
			</b-table-column>

		</Table>
	</div>
</template>

<script>
import { generateColumns } from "@/utils/datagrid";
import CountrySpecificOptionsService from "@/services/CountrySpecificOptionsService";
import Table from "@/components/Table";
import ActionButton from "@/components/ActionButton";
import CountrySpecificsForm from "@/components/Configuration/CountrySpecificsForm";
import SafeDelete from "@/components/SafeDelete";
import { Toast } from "@/utils/UI";
import Modal from "@/components/Modal";

export default {
	name: "CountrySpecificOptionsList",

	components: {
		Modal,
		SafeDelete,
		CountrySpecificsForm,
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
						key: "field",
						label: "Field",
					},
					{
						key: "type",
						label: "Type",
					},
				],
				total: 0,
				currentPage: 1,
				perPage: 15,
			},
			countrySpecificsModal: {
				isOpened: false,
				isDetail: false,
			},
			countrySpecificsModel: {
				id: null,
				field: "",
				type: "",
			},
		};
	},

	watch: {
		$route: "fetchData",
	},

	computed: {
		modalHeader() {
			let result = "";
			if (this.countrySpecificsModal.isDetail) {
				result = "Detail of Country Specifics";
			} else {
				result = "Create new Country Specifics";
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

				await CountrySpecificOptionsService.getListOfCountrySpecificOptions(
					this.table.currentPage,
					this.table.perPage,
					"desc",
				).then((response) => {
					this.table.data = response.data;
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

		handleError(error) {
			console.error(error);
			this.fetch.loading = false;
			this.fetch.error = error.toString();
		},

		showDetailWithId(id) {
			const countrySpecifics = this.table.data.find((item) => item.id === id);
			this.showDetail(countrySpecifics);
		},

		showDetail(countrySpecifics) {
			this.mapToFormModel(countrySpecifics);
			this.countrySpecificsModal = {
				isOpened: true,
				isDetail: true,
			};
		},

		mapToFormModel(
			{
				id,
				field,
				type,
			},
		) {
			this.countrySpecificsModel = {
				...this.countrySpecificsModel,
				id,
				field,
				type,
			};
		},

		closeCountrySpecificsModal() {
			this.countrySpecificsModal.isOpened = false;
		},

		addNewCountrySpecifics() {
			this.countrySpecificsModal = {
				isOpened: true,
				isDetail: false,
			};

			this.countrySpecificsModel = {
				...this.countrySpecificsModel,
				id: null,
				field: "",
				type: "",
			};
		},

		submitCountrySpecificsForm(countrySpecificsForm) {
			const {
				field,
				type,
			} = countrySpecificsForm;

			const countrySpecificsBody = {
				field,
				type,
				iso3: this.$store.state.country,
			};

			this.createCountrySpecifics(countrySpecificsBody);

			this.closeCountrySpecificsModal();
		},

		async createCountrySpecifics(countrySpecificsBody) {
			await CountrySpecificOptionsService.createCountrySpecificOption(countrySpecificsBody)
				.then((response) => {
					if (response.status === 200) {
						Toast("Country Specifics Successfully Created", "is-success");
						this.fetchData();
					}
				});
		},

		async onRemoveCountrySpecifics(id) {
			await CountrySpecificOptionsService.deleteCountryOption(id)
				.then((response) => {
					if (response.status === 204) {
						Toast("Country Specifics successfully removed", "is-success");
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
