import { formDataUtils } from "../lib/form-data-utils";
import type {
	DataTypeStrategyMap,
	DataTypeStrategyOpts,
	DbDialect,
	DbDialectStrategy,
	PkStrategy,
} from "../lib/types";
import { renderTemplate } from "../lib/utils";

const postgresqlDataTypeStrategies: DataTypeStrategyMap = {
	integer: {
		jsType: "number",
		formTemplate: "scaffold-processor/components/table/create-input.tsx.hbs",
		updateFormTemplate:
			"scaffold-processor/components/table/update-input.tsx.hbs",
		getKeyValueStrForSchema: (opts: DataTypeStrategyOpts): string =>
			`${opts.columnName}: integer(\"${opts.columnName}\")`,
		getKeyValStrForFormData: (opts: DataTypeStrategyOpts): string =>
			formDataUtils.integer(opts.columnName),
	},
	smallint: {
		jsType: "number",
		formTemplate: "scaffold-processor/components/table/create-input.tsx.hbs",
		updateFormTemplate:
			"scaffold-processor/components/table/update-input.tsx.hbs",
		getKeyValueStrForSchema: (opts: DataTypeStrategyOpts): string =>
			`${opts.columnName}: smallint(\"${opts.columnName}\")`,
		getKeyValStrForFormData: (opts: DataTypeStrategyOpts): string =>
			formDataUtils.integer(opts.columnName),
	},
	bigint: {
		jsType: "number",
		formTemplate: "scaffold-processor/components/table/create-input.tsx.hbs",
		updateFormTemplate:
			"scaffold-processor/components/table/update-input.tsx.hbs",
		getKeyValueStrForSchema: (opts: DataTypeStrategyOpts): string =>
			`${opts.columnName}: bigint(\"${opts.columnName}\", { mode: "number" })`,
		getKeyValStrForFormData: (opts: DataTypeStrategyOpts): string =>
			formDataUtils.integer(opts.columnName),
	},
	serial: {
		jsType: "number",
		formTemplate: "scaffold-processor/components/table/create-input.tsx.hbs",
		updateFormTemplate:
			"scaffold-processor/components/table/update-input.tsx.hbs",
		getKeyValueStrForSchema: (opts: DataTypeStrategyOpts): string =>
			`${opts.columnName}: serial(\"${opts.columnName}\")`,
		getKeyValStrForFormData: (opts: DataTypeStrategyOpts): string =>
			formDataUtils.integer(opts.columnName),
	},
	smallserial: {
		jsType: "number",
		formTemplate: "scaffold-processor/components/table/create-input.tsx.hbs",
		updateFormTemplate:
			"scaffold-processor/components/table/update-input.tsx.hbs",
		getKeyValueStrForSchema: (opts: DataTypeStrategyOpts): string =>
			`${opts.columnName}: smallserial(\"${opts.columnName}\")`,
		getKeyValStrForFormData: (opts: DataTypeStrategyOpts): string =>
			formDataUtils.integer(opts.columnName),
	},
	bigserial: {
		jsType: "number",
		formTemplate: "scaffold-processor/components/table/create-input.tsx.hbs",
		updateFormTemplate:
			"scaffold-processor/components/table/update-input.tsx.hbs",
		getKeyValueStrForSchema: (opts: DataTypeStrategyOpts): string =>
			`${opts.columnName}: bigserial(\"${opts.columnName}\", { mode: "number" })`,
		getKeyValStrForFormData: (opts: DataTypeStrategyOpts): string =>
			formDataUtils.integer(opts.columnName),
	},
	boolean: {
		jsType: "boolean",
		formTemplate: "scaffold-processor/components/table/create-checkbox.tsx.hbs",
		updateFormTemplate:
			"scaffold-processor/components/table/update-checkbox.tsx.hbs",
		getKeyValueStrForSchema: (opts: DataTypeStrategyOpts): string =>
			`${opts.columnName}: boolean(\"${opts.columnName}\")`,
		getKeyValStrForFormData: (opts: DataTypeStrategyOpts): string =>
			formDataUtils.boolean(opts.columnName),
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
	varchar: {
		jsType: "string",
		formTemplate: "scaffold-processor/components/table/create-input.tsx.hbs",
		updateFormTemplate:
			"scaffold-processor/components/table/update-input.tsx.hbs",
		getKeyValueStrForSchema: (opts: DataTypeStrategyOpts): string =>
			`${opts.columnName}: varchar(\"${opts.columnName}\", { length: 255 })`,
		getKeyValStrForFormData: (opts: DataTypeStrategyOpts): string =>
			formDataUtils.string(opts.columnName),
	},
	char: {
		jsType: "string",
		formTemplate: "scaffold-processor/components/table/create-input.tsx.hbs",
		updateFormTemplate:
			"scaffold-processor/components/table/update-input.tsx.hbs",
		getKeyValueStrForSchema: (opts: DataTypeStrategyOpts): string =>
			`${opts.columnName}: char(\"${opts.columnName}\", { length: 255 })`,
		getKeyValStrForFormData: (opts: DataTypeStrategyOpts): string =>
			formDataUtils.string(opts.columnName),
	},
	numeric: {
		jsType: "number",
		formTemplate: "scaffold-processor/components/table/create-input.tsx.hbs",
		updateFormTemplate:
			"scaffold-processor/components/table/update-input.tsx.hbs",
		getKeyValueStrForSchema: (opts: DataTypeStrategyOpts): string =>
			`${opts.columnName}: numeric(\"${opts.columnName}\")`,
		getKeyValStrForFormData: (opts: DataTypeStrategyOpts): string =>
			formDataUtils.string(opts.columnName),
	},
	decimal: {
		jsType: "number",
		formTemplate: "scaffold-processor/components/table/create-input.tsx.hbs",
		updateFormTemplate:
			"scaffold-processor/components/table/update-input.tsx.hbs",
		getKeyValueStrForSchema: (opts: DataTypeStrategyOpts): string =>
			`${opts.columnName}: decimal(\"${opts.columnName}\")`,
		getKeyValStrForFormData: (opts: DataTypeStrategyOpts): string =>
			formDataUtils.string(opts.columnName),
	},
	real: {
		jsType: "number",
		formTemplate: "scaffold-processor/components/table/create-input.tsx.hbs",
		updateFormTemplate:
			"scaffold-processor/components/table/update-input.tsx.hbs",
		getKeyValueStrForSchema: (opts: DataTypeStrategyOpts): string =>
			`${opts.columnName}: real(\"${opts.columnName}\")`,
		getKeyValStrForFormData: (opts: DataTypeStrategyOpts): string =>
			formDataUtils.float(opts.columnName),
	},
	doublePrecision: {
		jsType: "number",
		formTemplate: "scaffold-processor/components/table/create-input.tsx.hbs",
		updateFormTemplate:
			"scaffold-processor/components/table/update-input.tsx.hbs",
		getKeyValueStrForSchema: (opts: DataTypeStrategyOpts): string =>
			`${opts.columnName}: doublePrecision(\"${opts.columnName}\")`,
		getKeyValStrForFormData: (opts: DataTypeStrategyOpts): string =>
			formDataUtils.float(opts.columnName),
	},
	json: {
		jsType: "object",
		formTemplate: "scaffold-processor/components/table/create-input.tsx.hbs",
		updateFormTemplate:
			"scaffold-processor/components/table/update-input-json.tsx.hbs",
		getKeyValueStrForSchema: (opts: DataTypeStrategyOpts): string =>
			`${opts.columnName}: json(\"${opts.columnName}\")`,
		getKeyValStrForFormData: (opts: DataTypeStrategyOpts): string =>
			formDataUtils.json(opts.columnName),
	},
	jsonb: {
		jsType: "object",
		formTemplate: "scaffold-processor/components/table/create-input.tsx.hbs",
		updateFormTemplate:
			"scaffold-processor/components/table/update-input-json.tsx.hbs",
		getKeyValueStrForSchema: (opts: DataTypeStrategyOpts): string =>
			`${opts.columnName}: jsonb(\"${opts.columnName}\")`,
		getKeyValStrForFormData: (opts: DataTypeStrategyOpts): string =>
			formDataUtils.json(opts.columnName),
	},
	time: {
		jsType: "string",
		formTemplate: "scaffold-processor/components/table/create-input.tsx.hbs",
		updateFormTemplate:
			"scaffold-processor/components/table/update-input.tsx.hbs",
		getKeyValueStrForSchema: (opts: DataTypeStrategyOpts): string =>
			`${opts.columnName}: time(\"${opts.columnName}\")`,
		getKeyValStrForFormData: (opts: DataTypeStrategyOpts): string =>
			formDataUtils.string(opts.columnName),
	},
	timestamp: {
		jsType: "string",
		formTemplate: "scaffold-processor/components/table/create-input.tsx.hbs",
		updateFormTemplate:
			"scaffold-processor/components/table/update-input-timestamp.tsx.hbs",
		getKeyValueStrForSchema: (opts: DataTypeStrategyOpts): string =>
			`${opts.columnName}: timestamp(\"${opts.columnName}\")`,
		getKeyValStrForFormData: (opts: DataTypeStrategyOpts): string =>
			formDataUtils.date(opts.columnName),
	},
	date: {
		jsType: "string",
		formTemplate: "scaffold-processor/components/table/create-input.tsx.hbs",
		updateFormTemplate:
			"scaffold-processor/components/table/update-input.tsx.hbs",
		getKeyValueStrForSchema: (opts: DataTypeStrategyOpts): string =>
			`${opts.columnName}: date(\"${opts.columnName}\")`,
		getKeyValStrForFormData: (opts: DataTypeStrategyOpts): string =>
			formDataUtils.string(opts.columnName),
	},
	uuid: {
		jsType: "string",
		formTemplate: "scaffold-processor/components/table/create-input.tsx.hbs",
		updateFormTemplate:
			"scaffold-processor/components/table/update-input.tsx.hbs",
		getKeyValueStrForSchema: (opts: DataTypeStrategyOpts): string =>
			`${opts.columnName}: uuid(\"${opts.columnName}\")`,
		getKeyValStrForFormData: (opts: DataTypeStrategyOpts): string =>
			formDataUtils.string(opts.columnName),
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

export class PostgresqlDialectStrategy implements DbDialectStrategy {
	authSchemaTemplate = "db-dialects/schema/user.ts.postgresql.hbs";
	pkStrategyTemplates: Record<PkStrategy, string> = {
		uuidv7: `id: text("id").notNull().primaryKey().$defaultFn(() => uuidv7()),`,
		uuidv4: `id: text("id").notNull().primaryKey().$defaultFn(() => crypto.randomUUID()),`,
		uuid: `id: uuid("id").notNull().primaryKey().defaultRandom(),`,
		"auto-increment": `id: bigserial("id", { mode: "number" }).notNull().primaryKey(),`,
	};
	stripeSchemaTemplatePath = "stripe-processor/schema/stripe.ts.postgresql.hbs";
	drizzleDbCorePackage = "drizzle-orm/pg-core";
	tableConstructor = "pgTable";
	dialectArgsMap = {
		"default-now": ".defaultNow()",
	};
	schemaTableTemplatePath = "scaffold-processor/schema/table.ts.postgresql.hbs";
	dataTypeStrategyMap: DataTypeStrategyMap = postgresqlDataTypeStrategies;
	dialect: DbDialect = "postgresql";

	init(): void {
		this.copyDrizzleConfig();
		this.copySchema();
	}

	copyDrizzleConfig(): void {
		renderTemplate({
			inputPath: "db-dialects/drizzle.config.ts.hbs",
			outputPath: "drizzle.config.ts",
			data: { dialect: "postgresql" },
		});
	}

	copySchema(): void {
		renderTemplate({
			inputPath: "db-dialects/lib/schema.ts.postgresql.hbs",
			outputPath: "lib/schema.ts",
			data: {},
		});
	}
}
