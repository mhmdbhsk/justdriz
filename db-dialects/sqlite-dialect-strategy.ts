import { formDataUtils } from "../lib/form-data-utils";
import type {
	DataTypeStrategyMap,
	DataTypeStrategyOpts,
	DbDialect,
	DbDialectStrategy,
	PkStrategy,
} from "../lib/types";
import { renderTemplate } from "../lib/utils";

const sqliteDataTypeStrategies: DataTypeStrategyMap = {
	integer: {
		jsType: "number",
		formTemplate: "scaffold-processor/components/table/create-input.tsx.hbs",
		updateFormTemplate:
			"scaffold-processor/components/table/update-input.tsx.hbs",
		getKeyValueStrForSchema: (opts: DataTypeStrategyOpts) =>
			`${opts.columnName}: integer("${opts.columnName}")`,
		getKeyValStrForFormData: (opts: DataTypeStrategyOpts): string =>
			formDataUtils.integer(opts.columnName),
	},
	real: {
		jsType: "number",
		formTemplate: "scaffold-processor/components/table/create-input.tsx.hbs",
		updateFormTemplate:
			"scaffold-processor/components/table/update-input.tsx.hbs",
		getKeyValueStrForSchema: (opts: DataTypeStrategyOpts): string =>
			`${opts.columnName}: real("${opts.columnName}")`,
		getKeyValStrForFormData: (opts: DataTypeStrategyOpts): string =>
			formDataUtils.float(opts.columnName),
	},
	text: {
		jsType: "string",
		formTemplate: "scaffold-processor/components/table/create-textarea.tsx.hbs",
		updateFormTemplate:
			"scaffold-processor/components/table/update-textarea.tsx.hbs",
		getKeyValueStrForSchema: (opts: DataTypeStrategyOpts): string =>
			`${opts.columnName}: text(\"${opts.columnName}\")`,
		getKeyValStrForFormData: (opts: DataTypeStrategyOpts): string =>
			formDataUtils.string(opts.columnName),
	},
	boolean: {
		jsType: "boolean",
		formTemplate: "scaffold-processor/components/table/create-checkbox.tsx.hbs",
		updateFormTemplate:
			"scaffold-processor/components/table/update-checkbox.tsx.hbs",
		getKeyValueStrForSchema: (opts: DataTypeStrategyOpts): string =>
			`${opts.columnName}: integer("${opts.columnName}", { mode: "boolean" } )`,
		getKeyValStrForFormData: (opts: DataTypeStrategyOpts): string =>
			formDataUtils.boolean(opts.columnName),
	},
	bigint: {
		jsType: "number",
		formTemplate: "scaffold-processor/components/table/create-input.tsx.hbs",
		updateFormTemplate:
			"scaffold-processor/components/table/update-input.tsx.hbs",
		getKeyValueStrForSchema: (opts: DataTypeStrategyOpts): string =>
			`${opts.columnName}: blob("${opts.columnName}", { mode: "bigint" })`,
		getKeyValStrForFormData: (opts: DataTypeStrategyOpts): string =>
			formDataUtils.bigint(opts.columnName),
	},
	file: {
		jsType: "string",
		formTemplate: "scaffold-processor/components/table/create-file.tsx.hbs",
		updateFormTemplate:
			"scaffold-processor/components/table/update-file.tsx.hbs",
		getKeyValueStrForSchema: (opts: DataTypeStrategyOpts): string =>
			`${opts.columnName}: text(\"${opts.columnName}\")`,
		getKeyValStrForFormData: (opts: DataTypeStrategyOpts): string =>
			formDataUtils.string(opts.columnName),
	},
	image: {
		jsType: "string",
		formTemplate: "scaffold-processor/components/table/create-image.tsx.hbs",
		updateFormTemplate:
			"scaffold-processor/components/table/update-image.tsx.hbs",
		getKeyValueStrForSchema: (opts: DataTypeStrategyOpts): string =>
			`${opts.columnName}: text(\"${opts.columnName}\")`,
		getKeyValStrForFormData: (opts: DataTypeStrategyOpts): string =>
			formDataUtils.string(opts.columnName),
	},
};

export class SqliteDialectStrategy implements DbDialectStrategy {
	authSchemaTemplate = "db-dialects/schema/user.ts.sqlite.hbs";
	pkStrategyTemplates: Record<PkStrategy, string> = {
		uuidv7: `id: text("id").notNull().primaryKey().$defaultFn(() => uuidv7()),`,
		uuidv4: `id: text("id").notNull().primaryKey().$defaultFn(() => crypto.randomUUID()),`,
		uuid: `id: text("id").notNull().primaryKey().$defaultFn(() => crypto.randomUUID()),`,
		"auto-increment": `id: integer("id", { mode: "number" }).notNull().primaryKey({ autoIncrement: true }),`,
	};
	stripeSchemaTemplatePath = "stripe-processor/schema/stripe.ts.sqlite.hbs";
	tableConstructor = "sqliteTable";
	dialectArgsMap = {
		"pk-auto": ".primaryKey({ autoIncrement: true })",
		"default-now": ".default(sql`(CURRENT_DATE)`)",
	};
	schemaTableTemplatePath = "scaffold-processor/schema/table.ts.sqlite.hbs";
	drizzleDbCorePackage = "drizzle-orm/sqlite-core";
	dataTypeStrategyMap: DataTypeStrategyMap = sqliteDataTypeStrategies;
	dialect: DbDialect = "sqlite";

	init(): void {
		this.copyDrizzleConfig();
		this.copySchema();
	}

	copyDrizzleConfig(): void {
		renderTemplate({
			inputPath: "db-dialects/drizzle.config.ts.hbs",
			outputPath: "drizzle.config.ts",
			data: { dialect: "sqlite" },
		});
	}

	copySchema(): void {
		renderTemplate({
			inputPath: "db-dialects/lib/schema.ts.sqlite.hbs",
			outputPath: "lib/schema.ts",
		});
	}
}
