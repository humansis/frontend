<template>
	<div class="card">
		<div class="card-content">
			<div class="content">
				<b-progress size="is-large">
					<template #bar>
						<b-progress-bar type="is-success" show-value :value="90"  />
						<b-progress-bar type="is-danger" show-value :value="10" />
					</template>
				</b-progress>
				<table>
					<tbody>
						<tr>
							<td>Number of Records:</td>
							<td class="has-text-right">
								<b-tag
									class="has-text-weight-bold"
									type="is-light"
									size="is-medium"
								>
									100
								</b-tag>
							</td>
						</tr>
						<tr>
							<td>Similarities found:</td>
							<td class="has-text-right">
								<b-tag
									class="has-text-weight-bold"
									type="is-danger"
									size="is-medium"
								>
									10
								</b-tag>
							</td>
						</tr>
						<tr>
							<td>Duplicities found:</td>
							<td class="has-text-right">
								<b-tag
									class="has-text-weight-bold"
									type="is-danger"
									size="is-medium"
								>
									10
								</b-tag>
							</td>
						</tr>
						<tr>
							<td>Duplicities corrected/merged:</td>
							<td class="has-text-right">
								<b-tag
									class="has-text-weight-bold"
									type="is-success"
									size="is-medium"
								>
									10
								</b-tag>
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			<div class="buttons mt-5 flex-end">
				<b-button
					type="is-light is-danger"
					icon-right="ban"
				>
					{{ $t('Cancel Import') }}
				</b-button>
				<b-button
					type="is-primary"
					icon-right="tasks"
				>
					{{ $t('Resolve Similarities') }}
				</b-button>
				<b-button
					type="is-primary"
					icon-right="play-circle"
				>
					{{ $t('Go to Finalisation') }}
				</b-button>
			</div>

			<hr>

			<h2 class="subtitle is-5 mb-4">
				Similarity or Duplicity Cases
			</h2>

			<div class="content">
				<table>
					<thead>
						<tr>
							<th>Imported Record</th>
							<th>Records From Database</th>
							<th>Similarities</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Three</td>
							<td>Four</td>
							<td>Four</td>
							<td>Action</td>
						</tr>
						<tr>
							<td />
							<td>Six</td>
							<td>Six</td>
							<td>Action</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "DuplicityStep",
};
</script>
