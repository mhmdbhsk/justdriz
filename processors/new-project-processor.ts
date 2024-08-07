import type { NewProjectProcessorOpts, JustdrizProcessor } from "../lib/types";
import {
	addJustDComponents,
	installDependencies,
	installDevDependencies,
	renderTemplate,
	renderTemplateIfNotExists,
	spawnCommand,
} from "../lib/utils";
import { getReadme, getTableOfContents } from "../lib/markdown";

export class NewProjectProcessor implements JustdrizProcessor {
	opts: NewProjectProcessorOpts;

	dependencies = [
		"drizzle-orm",
		"dotenv",
		"uuidv7",
		"zod",
		"drizzle-zod",
		"@tanstack/react-table",
		"nanoid",
		"nanoid-dictionary",
	];

	devDependencies = ["drizzle-kit"];

	justDComponents: string[] = [
		"table",
		"label",
		"input",
		"button",
		"textarea",
		"checkbox",
		"scroll-area",
	];

	constructor(opts: NewProjectProcessorOpts) {
		this.opts = opts;
	}

	async init() {
		await this.install();
		await this.render();
	}

	async install() {
		if (!this.opts.install) {
			return;
		}

		if (this.opts.pnpm) {
			await spawnCommand("pnpm dlx justd-cli@latest init");
		} else if (this.opts.bun) {
			await spawnCommand("bunx --bun justd-cli@latest init");
		} else {
			await spawnCommand("npx justd-cli@latest init");
		}

		await installDependencies({
			dependencies: this.dependencies,
			pnpm: this.opts.pnpm,
			bun: this.opts.bun,
			latest: this.opts.latest,
		});

		await installDevDependencies({
			devDependencies: this.devDependencies,
			pnpm: this.opts.pnpm,
			bun: this.opts.bun,
			latest: this.opts.latest,
		});

		await addJustDComponents({
			pnpm: this.opts.pnpm,
			bun: this.opts.bun,
			justDComponents: this.justDComponents,
		});
	}

	async render() {
		const html = await getReadme();
		const toc = await getTableOfContents();

		renderTemplate({
			inputPath: "new-project-processor/app/(public)/docs/page.tsx.hbs",
			outputPath: "app/(public)/docs/page.tsx",
			data: { readme: html, toc: toc },
		});

		renderTemplate({
			inputPath: "new-project-processor/app/page.tsx.hbs",
			outputPath: "app/page.tsx",
		});

		renderTemplate({
			inputPath: "new-project-processor/components/header.tsx.hbs",
			outputPath: "components/header.tsx",
			data: {
				darkMode: this.opts.darkMode,
				authEnabled: this.opts.authEnabled,
				stripeEnabled: this.opts.stripeEnabled,
			},
		});

		renderTemplate({
			inputPath: "new-project-processor/components/footer.tsx.hbs",
			outputPath: "components/footer.tsx",
		});

		renderTemplate({
			inputPath: "new-project-processor/app/(public)/layout.tsx.hbs",
			outputPath: "app/(public)/layout.tsx",
		});

		renderTemplate({
			inputPath: "new-project-processor/lib/file-utils.ts.hbs",
			outputPath: "lib/file-utils.ts",
		});

		renderTemplate({
			inputPath: "new-project-processor/styles/docs.css",
			outputPath: "styles/docs.css",
		});

		renderTemplateIfNotExists({
			inputPath: "new-project-processor/.env.local.hbs",
			outputPath: ".env.local",
		});

		renderTemplate({
			inputPath: "new-project-processor/lib/config.ts.hbs",
			outputPath: "lib/config.ts",
		});

		renderTemplate({
			inputPath: "new-project-processor/components/ui/data-table.tsx.hbs",
			outputPath: "components/ui/data-table.tsx",
		});
	}
}
