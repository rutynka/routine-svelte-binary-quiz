import App from './App.svelte';

const app = new App({
	target: document.getElementsByTagName('main')[0],
	props: {
		name: 'rutynka_svelte_binary_quiz',
	}
});

export default app;