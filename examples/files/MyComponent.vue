<template>
	<div>
		<p>Counter: {{ counter }}</p>
		<div>
			<button @click="increment">Increment</button>
			<button @click="decrement">Decrement</button>
		</div>
	</div>
</template>

<script>
import { defineComponent } from "vue";
export default defineComponent({
	data() {
		return {
			counter: 1,
		};
	},
	methods: {
		increment() {
			this.counter++;
		},
		decrement() {
			this.counter--;
		},
	},
});
</script>

<style>
button {
	padding: 0.5rem;
	font-size: 1.3rem;
	color: white;
	margin-right: 1rem;
}
button:nth-child(1) {
	background: green;
}
button:nth-child(2) {
	background: red;
}
</style>
