<template>
	<div>
		<h2 class="title">Project assistances</h2>
		<b-table
			:data="tableData"
			:paginated="true"
			:per-page="'15'"
			:current-page="1"
			:pagination-simple="false"
			:pagination-position="'bottom'"
			:default-sort-direction="'asc'"
			:sort-icon="'arrow-up'"
			:sort-icon-size="'is-small'"
			:striped="true"
			default-sort="date"
			aria-next-label="Next page"
			aria-previous-label="Previous page"
			aria-page-label="Page"
			aria-current-label="Current page"
		>
			<template slot-scope="props">

				<template v-for="(entry, keymain) in props.row">
					<b-table-column
						:key="keymain"
						:field="keymain"
						:label="normalizeText(keymain)"
						sortable
					>
						<template>{{ entry }}</template>
					</b-table-column>
				</template>

			</template>
		</b-table>
	</div>
</template>
<script>
import { fetcher } from "@/utils/fetcher";
import { normalizeText } from "@/utils/normalizeText";

export default {
	name: "Assistances",

	data() {
		return {
			fetch: {
				error: null,
			},
			tableData: [],
		};
	},

	watch: {
		$route: "fetchData",
	},

	mounted() {
		this.fetchData();
	},

	methods: {
		normalizeText(text) {
			return normalizeText(text);
		},

		async fetchData() {
			try {
				this.fetch.error = null;
				const loadingComponent = this.$buefy.loading.open({
					container: this.$refs.table,
				});

				this.tableData = [];

				const uri = `assistances/${this.$route.params.id}`;
				const { data } = await fetcher({ uri, auth: true });
				this.tableData = data;
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
	},
};
</script>
