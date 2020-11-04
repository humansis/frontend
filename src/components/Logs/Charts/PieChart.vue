<script>
import { Pie } from "vue-chartjs";

export default {
	name: "PieChart",

	extends: Pie,

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
