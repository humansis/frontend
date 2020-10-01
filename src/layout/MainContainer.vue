<template>
	<div>
		<ul>
			<li>
				<router-link :to="{ name: 'Home' }">Home</router-link>
			</li>
			<li>
				<router-link :to="{ name: 'Projects' }">Projects</router-link>
			</li>
		</ul>
		<router-view />
	</div>
</template>
