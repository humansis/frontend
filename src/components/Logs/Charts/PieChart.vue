<script>
import { Pie } from "vue-chartjs";

export default {
	name: "PieChart",

	extends: Pie,

	props: {
		datacollection: {},
		options: {},
	},

	mounted() {
		this.renderChart(this.datacollection, this.options);
	},

	watch: {
		datacollection() {
			this.renderChart(this.datacollection, this.options);
		},
	},

};
</script>
