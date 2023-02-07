import "./CanvasApp.css";
import {} from "helion/core.js";
import {} from "helion/Intangible.js";
import {} from "helion/Stack.js";
import {} from "helion/Panel.js";
import {} from "helion/AltSurface.js";
import {} from "helion/CircleButton.js";
import {} from "helion/LightTheme.js";
import { fa5_brands_github, fa5_solid_home, fa5_solid_info, fa5_solid_times } from "fontawesome-svgs";

const html = /* html */ `
<helion-stack class="CanvasApp helion-alt-surface">
	<helion-intangible class="CanvasApp_ActionButtons">
		<button class="helion-circle-button CanvasApp_Button CanvasApp_ToggleDialog">${fa5_solid_info}</button>
		<div style="flex: 1;"></div>
		<a><!-- GitHub link --></a>
		<a class="helion-circle-button CanvasApp_Button" href="/">${fa5_solid_home}</a>
	</helion-intangible>
	
	<helion-stack class="helion-panel CanvasApp_Dialog">
		<div style="overflow: auto;">
			<div class="CanvasApp_DialogContents"></div>
		</div>
		<helion-intangible class="CanvasApp_ActionButtons">
			<button class="helion-circle-button CanvasApp_Button CanvasApp_ToggleDialog">${fa5_solid_times}</button>
		</helion-intangible>
	</helion-stack>
</helion-stack>
`;

function createElement() {
	const div = document.createElement("div");
	div.innerHTML = html;
	return div.firstElementChild as HTMLElement;
}


export class CanvasApp {
	readonly node = createElement()
	readonly dialog = this.node.querySelector(".CanvasApp_DialogContents") as HTMLElement;
	readonly #insertBefore = this.node.firstElementChild!;
	readonly #dialogContainer = this.node.querySelector(".CanvasApp_Dialog") as HTMLElement;

	readonly gitHubLink = this.node.querySelector("a") as HTMLAnchorElement;

	constructor() {
		const toggleDialogButtons = this.node.querySelectorAll(".CanvasApp_ToggleDialog") as NodeListOf<HTMLButtonElement>;
		for (const button of toggleDialogButtons) {
			button.onclick = () => this.toggleDialogOpen();
		}
	}

	addLayer(element: HTMLElement) {
		this.node.insertBefore(element, this.#insertBefore);
	}

	setGithubLink(src: string) {
		this.gitHubLink.classList.add("helion-circle-button", "CanvasApp_Button");
		this.gitHubLink.href = src;
		this.gitHubLink.innerHTML = fa5_brands_github;
		this.gitHubLink.target = "_blank";
	}

	toggleDialogOpen(toggle?: boolean) {
		this.#dialogContainer.toggleAttribute("data-opened", toggle);
	}
}