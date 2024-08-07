import type { DarkModeProcessorOpts, JustdrizProcessor } from "../lib/types";
import {
	addJustDComponents,
	installDependencies,
	installDevDependencies,
	renderTemplate,
} from "../lib/utils";

export class DarkModeProcessor implements JustdrizProcessor {
	constructor(public opts: DarkModeProcessorOpts) {}

	dependencies = ["next-themes"];

	devDependencies = [];

	justDComponents: string[] = ["dropdown-menu"];

	async init() {
		await this.install();
		await this.render();
	}

	async install() {
		if (!this.opts.install) {
			return;
		}

		await installDependencies({
			dependencies: this.dependencies,
			pnpm: this.opts.pnpm,
			latest: this.opts.latest,
			bun: this.opts.bun,
		});

		await installDevDependencies({
			devDependencies: this.devDependencies,
			pnpm: this.opts.pnpm,
			latest: this.opts.latest,
			bun: this.opts.bun,
		});

		await addJustDComponents({
			justDComponents: this.justDComponents,
			pnpm: this.opts.pnpm,
			bun: this.opts.bun,
		});
	}

	async render() {
		await this.addThemeProvider();
		await this.addRootLayout();
		await this.addModeToggle();
	}

	async addThemeProvider() {
		renderTemplate({
			inputPath: "dark-mode-processor/components/theme-provider.tsx.hbs",
			outputPath: "components/theme-provider.tsx",
		});
	}

	async addRootLayout() {
		renderTemplate({
			inputPath: "dark-mode-processor/app/layout.tsx.hbs",
			outputPath: "app/layout.tsx",
		});
	}

	async addModeToggle() {
		renderTemplate({
			inputPath: "dark-mode-processor/components/mode-toggle.tsx.hbs",
			outputPath: "components/mode-toggle.tsx",
		});
	}
}
