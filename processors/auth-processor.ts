import {
	addJustDComponents,
	appendToFileIfTextNotExists,
	compileTemplate,
	installDependencies,
	installDevDependencies,
	renderTemplate,
	spawnCommand,
} from "../lib/utils";
import { log } from "../lib/log";
import type {
	AuthProvider,
	DbDialectStrategy,
	PkStrategy,
	SessionStrategy,
	JustdrizProcessor,
} from "../lib/types";

interface AuthProcessorOpts {
	providers: AuthProvider[];
	pnpm: boolean;
	bun: boolean;
	sessionStrategy: SessionStrategy;
	install: boolean;
	latest: boolean;
	stripeEnabled: boolean;
	pkStrategy: PkStrategy;
	dbDialectStrategy: DbDialectStrategy;
}

interface AuthStrategy {
	importTemplatePath: string;
	authTemplatePath: string;
	envTemplatePath: string;
	dependencies?: string[];
	devDependencies?: string[];
	textToSearchInEnv: string;
	printCompletionMessage(): void;
}

interface AuthStrategyMap {
	github: AuthStrategy;
	google: AuthStrategy;
	credentials: AuthStrategy;
	postmark: AuthStrategy;
	nodemailer: AuthStrategy;
}

const authStrategyMap: AuthStrategyMap = {
	github: {
		importTemplatePath: "auth-processor/auth/auth.ts.github.imports.hbs",
		authTemplatePath: "auth-processor/auth/auth.ts.github.hbs",
		envTemplatePath: "auth-processor/auth/auth.ts.github.env.hbs",
		printCompletionMessage: (): void => {
			log.white("\nsetup github provider:");
			log.dash(
				"go to github > settings > developer settings > oauth apps > new oauth app",
			);
			log.dash("callback: http://localhost:3000/api/auth/callback/github");
			log.dash("update AUTH_GITHUB_ID in .env.local");
			log.dash("update AUTH_GITHUB_SECRET in .env.local");
		},
		textToSearchInEnv: "AUTH_GITHUB_ID",
	},
	google: {
		importTemplatePath: "auth-processor/auth/auth.ts.google.imports.hbs",
		authTemplatePath: "auth-processor/auth/auth.ts.google.hbs",
		envTemplatePath: "auth-processor/auth/auth.ts.google.env.hbs",
		printCompletionMessage: (): void => {
			log.white("\nsetup google provider:");
			log.dash(
				"go to console.cloud.google.com > new project > oauth consent screen + 2.0 client",
			);
			log.dash("callback: http://localhost:3000/api/auth/callback/google");
			log.dash("update AUTH_GOOGLE_ID in .env.local");
			log.dash("update AUTH_GOOGLE_SECRET in .env.local");
		},
		textToSearchInEnv: "AUTH_GOOGLE_ID",
	},
	credentials: {
		importTemplatePath: "auth-processor/auth/auth.ts.credentials.imports.hbs",
		authTemplatePath: "auth-processor/auth/auth.ts.credentials.hbs",
		envTemplatePath: "auth-processor/auth/auth.ts.credentials.env.hbs",
		dependencies: ["bcrypt"],
		devDependencies: ["@types/bcrypt"],
		printCompletionMessage: (): void => {
			log.white("\ncreate test user for credentials provider:");
			log.cmd(
				"npx tsx scripts/create-user.ts justdriz@example.com password123",
			);
		},
		textToSearchInEnv: "",
	},
	postmark: {
		importTemplatePath: "auth-processor/auth/auth.ts.postmark.imports.hbs",
		authTemplatePath: "auth-processor/auth/auth.ts.postmark.hbs",
		envTemplatePath: "auth-processor/auth/auth.ts.postmark.env.hbs",
		printCompletionMessage: (): void => {
			log.white("\nsetup postmark provider");
			log.dash("go to postmark > server > api tokens");
			log.dash("generate token");
			log.dash("change the from email in auth.ts");
			log.dash("update AUTH_POSTMARK_KEY in .env.local");
		},
		textToSearchInEnv: "AUTH_POSTMARK_KEY",
	},
	nodemailer: {
		importTemplatePath: "auth-processor/auth/auth.ts.nodemailer.imports.hbs",
		authTemplatePath: "auth-processor/auth/auth.ts.nodemailer.hbs",
		envTemplatePath: "auth-processor/auth/auth.ts.nodemailer.env.hbs",
		dependencies: ["nodemailer"],
		printCompletionMessage: (): void => {
			log.white("\nsetup nodemailer provider");
			log.dash("update EMAIL_SERVER in .env.local");
			log.dash("update EMAIL_FROM in .env.local");
		},
		textToSearchInEnv: "EMAIL_SERVER",
	},
};

export class AuthProcessor implements JustdrizProcessor {
	constructor(public opts: AuthProcessorOpts) {}

	dependencies = ["next-auth", "@auth/drizzle-adapter"];

	devDependencies = [];

	justDComponents: string[] = ["separator", "avatar"];

	async init() {
		this.validateOptions();
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
			bun: this.opts.bun,
			latest: this.opts.latest,
		});

		await this.installProviderDependencies();

		await addJustDComponents({
			justDComponents: this.justDComponents,
			pnpm: this.opts.pnpm,
			bun: this.opts.bun,
		});

		await this.appendAuthSecretToEnv();
	}

	async render() {
		this.addAuthConfig();
		this.addAuthRouteHandler();
		// this.addAuthMiddleware();
		this.appendSecretsToEnv();
		this.addPrivateLayout();
		this.addPrivateDashboard();
		this.addCustomSignInPage();
		this.addProfilePage();
		this.addSettingsPage();
		this.addAuthSchema();
	}

	validateOptions() {
		for (const provider of this.opts.providers) {
			if (!(provider in authStrategyMap)) {
				throw new Error(`invalid provider: ${provider}`);
			}
		}

		if (!["jwt", "database"].includes(this.opts.sessionStrategy)) {
			throw new Error(`invalid session strategy: ${this.opts.sessionStrategy}`);
		}

		if (
			this.opts.providers.includes("credentials") &&
			this.opts.sessionStrategy === "database"
		) {
			throw new Error("credentials provider must use jwt");
		}
	}

	async installProviderDependencies() {
		for (const provider of this.opts.providers) {
			const authStrategy = authStrategyMap[provider];
			if (authStrategy.dependencies) {
				await installDependencies({
					dependencies: authStrategy.dependencies,
					pnpm: this.opts.pnpm,
					latest: this.opts.latest,
					bun: this.opts.bun,
				});
			}
			if (authStrategy.devDependencies) {
				await installDevDependencies({
					devDependencies: authStrategy.devDependencies,
					pnpm: this.opts.pnpm,
					latest: this.opts.latest,
					bun: this.opts.bun,
				});
			}
		}
	}

	async appendAuthSecretToEnv() {
		if (this.opts.pnpm) {
			await spawnCommand("pnpm dlx auth secret");
		} else {
			await spawnCommand("npx auth secret");
		}
	}

	addAuthConfig() {
		let importsCode = "";
		let providersCode = "";
		for (const provider of this.opts.providers) {
			const strategy = authStrategyMap[provider];
			importsCode += compileTemplate({
				inputPath: strategy.importTemplatePath,
				data: {},
			});
			importsCode += "\n";
			providersCode += compileTemplate({
				inputPath: strategy.authTemplatePath,
				data: {},
			});
			providersCode += "\n";
		}
		renderTemplate({
			inputPath: "auth-processor/auth/auth.ts.hbs",
			outputPath: "auth.ts",
			data: {
				importsCode: importsCode,
				providersCode: providersCode,
				sessionStrategy: this.opts.sessionStrategy,
				isJwt: this.opts.sessionStrategy === "jwt",
				isUuidv7: this.opts.pkStrategy === "uuidv7",
			},
		});
	}

	addAuthRouteHandler() {
		renderTemplate({
			inputPath: "auth-processor/app/api/auth/[...nextauth]/route.ts.hbs",
			outputPath: "app/api/auth/[...nextauth]/route.ts",
		});
	}

	// addAuthMiddleware() {
	//   renderTemplate({
	//     inputPath: "middleware.ts.hbs",
	//     outputPath: "middleware.ts",
	//     data: {},
	//   });
	// }

	appendSecretsToEnv() {
		for (const provider of this.opts.providers) {
			const strategy = authStrategyMap[provider];
			let envVars = compileTemplate({
				inputPath: strategy.envTemplatePath,
				data: {},
			});
			envVars = `\n${envVars}`;
			appendToFileIfTextNotExists(
				".env.local",
				envVars,
				strategy.textToSearchInEnv,
			);
		}
	}

	addPrivateLayout() {
		renderTemplate({
			inputPath: "auth-processor/app/(private)/layout.tsx.hbs",
			outputPath: "app/(private)/layout.tsx",
			data: {
				stripeEnabled: this.opts.stripeEnabled,
			},
		});
	}

	addPrivateDashboard() {
		renderTemplate({
			inputPath: "auth-processor/app/(private)/dashboard/page.tsx.hbs",
			outputPath: "app/(private)/dashboard/page.tsx",
		});
	}

	addCustomSignInPage() {
		renderTemplate({
			inputPath: "auth-processor/app/signin/page.tsx.custom.hbs",
			outputPath: "app/signin/page.tsx",
			data: {
				providers: {
					google: this.opts.providers.includes("google"),
					github: this.opts.providers.includes("github"),
					credentials: this.opts.providers.includes("credentials"),
					postmark: this.opts.providers.includes("postmark"),
					nodemailer: this.opts.providers.includes("nodemailer"),
				},
			},
		});
	}

	addProfilePage() {
		renderTemplate({
			inputPath: "auth-processor/app/(private)/profile/page.tsx.hbs",
			outputPath: "app/(private)/profile/page.tsx",
		});
	}

	addSettingsPage() {
		renderTemplate({
			inputPath: "auth-processor/app/(private)/settings/page.tsx.hbs",
			outputPath: "app/(private)/settings/page.tsx",
		});
	}

	addAuthSchema() {
		const pkText =
			this.opts.dbDialectStrategy.pkStrategyTemplates[this.opts.pkStrategy];
		renderTemplate({
			inputPath: this.opts.dbDialectStrategy.authSchemaTemplate,
			outputPath: "schema/user.ts",
			data: {
				pkText: pkText,
				isUuidv7: this.opts.pkStrategy === "uuidv7",
			},
		});
	}

	printCompletionMessage() {
		log.success(`auth setup success: ${this.opts.providers.join(", ")}`);
		log.reminder();
		log.white("\nconfigure database:");
		log.dash("update DB_URL in .env.local");
		log.white("\nrun migrations:");
		log.cmd("npx drizzle-kit generate");
		log.cmd("npx drizzle-kit migrate");
		for (const provider of this.opts.providers) {
			const authStrategy = authStrategyMap[provider];
			authStrategy.printCompletionMessage();
		}
	}
}
