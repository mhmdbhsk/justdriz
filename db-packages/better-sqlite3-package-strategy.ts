import type {
	DbDialect,
	DbPackageStrategy,
	DbPackageStrategyOpts,
} from "../lib/types";
import {
	appendDbUrl,
	appendToFileIfTextNotExists,
	installDependencies,
	renderTemplate,
} from "../lib/utils";

export class BetterSqlite3PackageStrategy implements DbPackageStrategy {
	constructor(opts: DbPackageStrategyOpts) {
		this.opts = opts;
	}

	opts: DbPackageStrategyOpts;

	dialect: DbDialect = "sqlite";

	dependencies: string[] = ["better-sqlite3"];

	devDependencies: string[] = [];

	async init() {
		await this.install();
		await this.render();
	}

	async install(): Promise<void> {
		if (!this.opts.install) {
			return;
		}

		await installDependencies({
			dependencies: this.dependencies,
			pnpm: this.opts.pnpm,
			bun: this.opts.bun,
			latest: this.opts.latest,
		});
	}

	async render(): Promise<void> {
		this.copyMigrateScript();
		this.appendDbUrl();
		this.copyDbInstance();
		this.copyDbInstanceForScripts();
		this.appendSqliteToGitignore();
		this.copyCreateUserScript();
	}

	copyMigrateScript(): void {
		renderTemplate({
			inputPath: "db-packages/scripts/migrate.ts.better-sqlite3.hbs",
			outputPath: "scripts/migrate.ts",
		});
	}

	appendDbUrl(): void {
		appendDbUrl("sqlite.db");
	}

	copyDbInstance(): void {
		renderTemplate({
			inputPath: "db-packages/lib/db.ts.better-sqlite3.hbs",
			outputPath: "lib/db.ts",
		});
	}

	copyDbInstanceForScripts(): void {
		renderTemplate({
			inputPath: "db-packages/scripts/sdb.ts.better-sqlite3.hbs",
			outputPath: "scripts/sdb.ts",
		});
	}

	copyCreateUserScript() {
		renderTemplate({
			inputPath: "db-packages/scripts/create-user.ts.better-sqlite3.hbs",
			outputPath: "scripts/create-user.ts",
		});
	}

	appendSqliteToGitignore() {
		appendToFileIfTextNotExists(".gitignore", "\nsqlite.db", "sqlite.db");
	}
}
