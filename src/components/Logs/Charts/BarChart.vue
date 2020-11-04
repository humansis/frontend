<script>
import { Bar } from "vue-chartjs";

export default {
	name: "BarChart",

	extends: Bar,

	props: {
		dataCollection: {},
		options: {},
	},

	mounted() {
		this.renderChart(this.dataCollection, this.options);
	},

	watch: {
		dataCollection() {
			this.renderChart(this.dataCollection, this.options);
		},
	},

};
</script>
