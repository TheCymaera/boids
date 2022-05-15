for (const button of document.querySelectorAll<HTMLElement>(".js-toggleDialog")) {
	button.onclick = ()=>{
		document.body.toggleAttribute("data-dialog-opened");
	}
}

for (const button of document.querySelectorAll<HTMLElement>(".js-share")) {
	button.onclick = async ()=>{
		if (!navigator.share) {
			alert("Sharing is not available in this environment.");
			return;
		}
		
		try {
			await navigator.share({
				title: document.title,
				text: (document.querySelector('meta[name="description"]') as HTMLMetaElement)?.content ?? document.title,
				url: window.location.href
			});
		} catch(e) {
			if (e.name === "AbortError") return;
			alert("An error occurred: " + e.name);
		}
	}
}