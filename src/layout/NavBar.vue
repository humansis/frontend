<template>
	<b-navbar>
		<template slot="start">
			<b-navbar-item>
				<Breadcrumbs/>
			</b-navbar-item>
		</template>

		<template slot="end">
			<b-navbar-item>
				<b-icon
					icon="question"
					size="is-medium"
				/>
			</b-navbar-item>
			<b-dropdown
				position="is-bottom-left"
				append-to-body
				aria-role="menu">
				<a
					class="navbar-item"
					slot="trigger"
					role="button">
					<b-icon icon="globe-africa" size="is-medium" />
				</a>
				<b-dropdown-item value="KHM">
					<b-icon class="mr-1" icon="globe" />
					KHM
				</b-dropdown-item>
				<b-dropdown-item value="SYR">
					<b-icon class="mr-1" icon="globe" />
					SYR
				</b-dropdown-item>
				<b-dropdown-item value="UKR">
					<b-icon class="mr-1" icon="globe" />
					UKR
				</b-dropdown-item>
			</b-dropdown>
			<b-dropdown
				position="is-bottom-left"
				append-to-body
				aria-role="menu">
				<a
					class="navbar-item"
					slot="trigger"
					role="button">
					<b-icon icon="user" size="is-medium" />
				</a>
				<b-dropdown-item value="language">
					<b-icon class="mr-1" icon="language" />
					Language
				</b-dropdown-item>
				<b-dropdown-item value="profile">
					<b-icon class="mr-1" icon="user" />
					Profile
				</b-dropdown-item>
				<b-dropdown-item value="logout">
					<b-icon class="mr-1" icon="sign-out-alt" />
					Log out
				</b-dropdown-item>
			</b-dropdown>
		</template>
	</b-navbar>
</template>

<script>
export default {
	name: "NavBar",
};
</script>

<style lang="scss" scoped>
.dropdown-item {
	display: flex;
	align-items: center;
}
</style>
