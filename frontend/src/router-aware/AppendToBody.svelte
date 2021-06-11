<script>
import { onDestroy, onMount } from 'svelte';
import { onAfterLoad, onAfterUnload, onBeforeLoad, onBeforeUnload } from 'svelte-stack-router';


	let slotWrapperRef;
	let originalWrapperRef;

	onBeforeLoad(() => {
		originalWrapperRef.removeChild(slotWrapperRef);
		document.body.appendChild(slotWrapperRef);
		slotWrapperRef.classList.add('fade-in');
	});

	onBeforeUnload(() => {
		slotWrapperRef.classList.add('fade-out');
	});

	onAfterLoad(() => {
		slotWrapperRef.classList.remove('fade-in');
	})

	onAfterUnload(() => {
		document.body.removeChild(slotWrapperRef);
		originalWrapperRef.appendChild(slotWrapperRef);
		slotWrapperRef.classList.remove('fade-out');
	});
</script>

<div bind:this={originalWrapperRef}>
<div bind:this={slotWrapperRef}>
	<slot />
</div></div>
