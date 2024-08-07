import type {
	GetColumnDefObjsOpts,
	GetKeyValueStrForSchemaOpts,
	ScaffoldProcessorOpts,
} from "../lib/types";
import {
	appendToFile,
	capitalize,
	compileTemplate,
	renderTemplate,
	regenerateSchemaIndex,
	regenerateSchemaList,
} from "../lib/utils";
import { log } from "../lib/log";

// lib/schema.ts
// app/post/page.tsx
// app/post/[id]/page.tsx
// app/post/[id]/new/page.tsx
// app/post/[id]/edit/page.tsx
// app/post/[id]/delete/page.tsx
// actions/post/create-post.ts
// actions/post/update-post.ts
// actions/post/delete-post.ts
// components/post/post-columns.tsx
// components/post/post-create-form.tsx
// components/post/post-update-form.tsx
// components/post/post-delete-form.tsx
export class ScaffoldProcessor {
	opts: ScaffoldProcessorOpts;

	commonArgMap: { [key: string]: string } = {
		pk: ".primaryKey()",
		"default-uuidv7": ".$defaultFn(() => uuidv7())",
		"default-uuidv4": ".$defaultFn(() => crypto.randomUUID())",
	};

	constructor(opts: ScaffoldProcessorOpts) {
		this.opts = opts;
	}

	process(): void {
		// this.appendCodeToSchema(); // single file schema
		this.addSchema(); // multiple files schema
		this.addListView();
		this.addDetailView();
		this.addNewView();
		this.addEditView();
		this.addDeleteView();
		this.addCreateAction();
		this.addUpdateAction();
		this.addDeleteAction();
		this.addColumnDef();
		this.addCreateForm();
		this.addUpdateForm();
		this.addDeleteForm();
		regenerateSchemaIndex();
		regenerateSchemaList();
		this.printCompletionMessage();
	}
	appendCodeToSchema(): void {
		const { table, columns } = this.opts;
		// compile columns
		let columnsCode = "";
		for (const [index, column] of columns.entries()) {
			columnsCode += this.getKeyValueStrForSchema({ ...this.opts, column });
			if (index !== columns.length - 1) {
				columnsCode += "\n";
			}
		}
		// compile str
		const str = compileTemplate({
			inputPath: this.opts.dbDialectStrategy.schemaTableTemplatePath,
			data: { table, columns: columnsCode, typeName: capitalize(table) },
		});

		appendToFile("lib/schema.ts", str);
	}
	addSchema(): void {
		const { table, columns } = this.opts;
		// compile columns
		let columnsCode = "";
		for (const [index, column] of columns.entries()) {
			columnsCode += this.getKeyValueStrForSchema({ ...this.opts, column });
			if (index !== columns.length - 1) {
				columnsCode += "\n";
			}
		}
		// generate imports code
		const importsCode = this.generateImportsCodeFromColumns(columns);

		renderTemplate({
			inputPath: this.opts.dbDialectStrategy.schemaTableTemplatePath,
			outputPath: `schema/${table}.ts`,
			data: {
				table,
				columns: columnsCode,
				typeName: capitalize(table),
				imports: importsCode,
			},
		});
	}
	generateImportsCodeFromColumns(columns: string[]) {
		const dataTypeSet = new Set<string>();
		for (const column of columns) {
			const arr = column.split(":");
			if (arr[1] !== "file" && arr[1] !== "image") {
				dataTypeSet.add(arr[1]);
			}
		}
		console.log(dataTypeSet);
		let code = "import {\n";
		code += `  ${this.opts.dbDialectStrategy.tableConstructor},\n`;
		for (const dataType of dataTypeSet) {
			code += `  ${dataType},\n`;
		}
		code += `} from "${this.opts.dbDialectStrategy.drizzleDbCorePackage}";\n`;
		code += `import { createInsertSchema } from "drizzle-zod";\n`;
		const dependsOnUuidv7 = columns.filter((column) =>
			column.indexOf("default-uuidv7"),
		).length;
		if (dependsOnUuidv7) {
			code += `import { uuidv7 } from "uuidv7";\n`;
		}
		const dependsOnSql = columns.filter((column) =>
			column.indexOf("sql"),
		).length;
		if (dependsOnSql) {
			code += `import { sql } from "drizzle-orm";`;
		}
		return code;
	}
	getKeyValueStrForSchema(opts: GetKeyValueStrForSchemaOpts): string {
		const { column } = opts;
		const { dataTypeStrategyMap } = this.opts.dbDialectStrategy;
		const [columnName, dataType, arg1, arg2] = column.split(":");
		const args = [arg1, arg2];
		if (!(dataType in dataTypeStrategyMap)) {
			throw new Error(`data type strategy not found: ${dataType}`);
		}
		this.validateArgs(args);
		const strategy = dataTypeStrategyMap[dataType];
		let str = `    ${strategy.getKeyValueStrForSchema({ columnName: columnName })}`;
		for (const arg of args) {
			if (arg in this.commonArgMap) {
				str += this.commonArgMap[arg];
			}
			if (arg in this.opts.dbDialectStrategy.dialectArgsMap) {
				str += this.opts.dbDialectStrategy.dialectArgsMap[arg];
			}
		}
		str += this.commonFkArgHandler(args);
		str += ",";
		return str;
	}
	addListView(): void {
		renderTemplate({
			inputPath: "scaffold-processor/app/table/page.tsx.hbs",
			outputPath: `app/${this.authorizationRouteGroup()}${
				this.opts.table
			}/page.tsx`,
			data: {
				table: this.opts.table,
				isAdmin: this.opts.authorizationLevel === "admin",
			},
		});
	}
	addDetailView(): void {
		renderTemplate({
			inputPath: "scaffold-processor/app/table/[id]/page.tsx.hbs",
			outputPath: `app/${this.authorizationRouteGroup()}${
				this.opts.table
			}/[id]/page.tsx`,
			data: { table: this.opts.table },
		});
	}
	addEditView(): void {
		renderTemplate({
			inputPath: "scaffold-processor/app/table/[id]/edit/page.tsx.hbs",
			outputPath: `app/${this.authorizationRouteGroup()}${
				this.opts.table
			}/[id]/edit/page.tsx`,
			data: {
				table: this.opts.table,
				capitalizedTable: capitalize(this.opts.table),
			},
		});
	}
	addNewView(): void {
		renderTemplate({
			inputPath: "scaffold-processor/app/table/new/page.tsx.hbs",
			outputPath: `app/${this.authorizationRouteGroup()}${
				this.opts.table
			}/new/page.tsx`,
			data: {
				table: this.opts.table,
				capitalizedTable: capitalize(this.opts.table),
			},
		});
	}
	addDeleteView(): void {
		renderTemplate({
			inputPath: "scaffold-processor/app/table/[id]/delete/page.tsx.hbs",
			outputPath: `app/${this.authorizationRouteGroup()}${
				this.opts.table
			}/[id]/delete/page.tsx`,
			data: {
				table: this.opts.table,
				capitalizedTable: capitalize(this.opts.table),
			},
		});
	}
	addCreateAction(): void {
		const columns = this.opts.columns
			.map((c) => c.split(":"))
			.filter((arr) => !this.includesItemThatStartsWithPk(arr))
			.filter((arr) => !this.includesItemThatStartsWithDefault(arr))
			.filter((arr) => !this.isFileType(arr))
			.filter((arr) => !this.isImageType(arr))
			.map((arr) => arr[0]);

		const formDataKeyVal = this.opts.columns
			.map((c) => c.split(":"))
			.filter((arr) => !this.includesItemThatStartsWithPk(arr))
			.filter((arr) => !this.includesItemThatStartsWithDefault(arr))
			.filter((arr) => !this.isFileType(arr))
			.filter((arr) => !this.isImageType(arr))
			.map((arr) => {
				const col = arr[0];
				const dataType = arr[1];
				const strategy =
					this.opts.dbDialectStrategy.dataTypeStrategyMap[dataType];
				return strategy.getKeyValStrForFormData({ columnName: col });
			})
			.join("");

		const uploadColumnNames = this.opts.columns
			.map((c) => c.split(":"))
			.filter((arr) => this.isFileType(arr) || this.isImageType(arr))
			.map((arr) => arr[0]);

		renderTemplate({
			inputPath: "scaffold-processor/actions/table/create-table.ts.hbs",
			outputPath: `actions/${this.opts.table}/create-${this.opts.table}.ts`,
			data: {
				table: this.opts.table,
				capitalizedTable: capitalize(this.opts.table),
				columns: columns,
				formDataKeyVal: formDataKeyVal,
				isNotPublic: this.opts.authorizationLevel !== "public",
				isPrivate: this.opts.authorizationLevel === "private",
				isAdmin: this.opts.authorizationLevel === "admin",
				uploadColumnNames: uploadColumnNames,
				importFileUtils: uploadColumnNames.length > 0,
			},
		});
	}
	addUpdateAction(): void {
		const columns = this.opts.columns
			.map((c) => c.split(":"))
			.filter((arr) => !this.includesItemThatStartsWithPk(arr))
			.filter((arr) => !this.isFileType(arr))
			.filter((arr) => !this.isImageType(arr))
			.map((arr) => arr[0]);
		console.log(columns);

		const formDataKeyVal = this.opts.columns
			.map((c) => c.split(":"))
			.filter((arr) => !this.isFileType(arr))
			.filter((arr) => !this.isImageType(arr))
			.map((arr) => {
				const col = arr[0];
				const dataType = arr[1];
				const strategy =
					this.opts.dbDialectStrategy.dataTypeStrategyMap[dataType];
				return strategy.getKeyValStrForFormData({ columnName: col });
			})
			.join("");

		const uploadColumnNames = this.opts.columns
			.map((c) => c.split(":"))
			.filter((arr) => this.isFileType(arr) || this.isImageType(arr))
			.map((arr) => arr[0]);

		renderTemplate({
			inputPath: "scaffold-processor/actions/table/update-table.ts.hbs",
			outputPath: `actions/${this.opts.table}/update-${this.opts.table}.ts`,
			data: {
				table: this.opts.table,
				capitalizedTable: capitalize(this.opts.table),
				columns: columns,
				formDataKeyVal: formDataKeyVal,
				isNotPublic: this.opts.authorizationLevel !== "public",
				isPrivate: this.opts.authorizationLevel === "private",
				isAdmin: this.opts.authorizationLevel === "admin",
				uploadColumnNames: uploadColumnNames,
				importFileUtils: uploadColumnNames.length > 0,
			},
		});
	}
	addDeleteAction(): void {
		const formDataKeyVal = this.opts.columns
			.map((c) => c.split(":"))
			.filter((arr) => arr[0] === "id")
			.map((arr) => {
				const col = arr[0];
				const dataType = arr[1];
				const strategy =
					this.opts.dbDialectStrategy.dataTypeStrategyMap[dataType];
				return strategy.getKeyValStrForFormData({ columnName: col });
			})
			.join("");
		renderTemplate({
			inputPath: "scaffold-processor/actions/table/delete-table.ts.hbs",
			outputPath: `actions/${this.opts.table}/delete-${this.opts.table}.ts`,
			data: {
				table: this.opts.table,
				capitalizedTable: capitalize(this.opts.table),
				isNotPublic: this.opts.authorizationLevel !== "public",
				isPrivate: this.opts.authorizationLevel === "private",
				isAdmin: this.opts.authorizationLevel === "admin",
				formDataKeyVal: formDataKeyVal,
			},
		});
	}
	addColumnDef(): void {
		let columnDefs = "";
		for (const [index, str] of this.opts.columns.entries()) {
			const [columnName, dataType] = str.split(":");
			columnDefs += this.getColumnDefObjs({
				columnName: columnName,
			});
			if (index !== this.opts.columns.length - 1) {
				columnDefs += "\n";
			}
		}
		const capitalizedTableName = capitalize(this.opts.table);
		renderTemplate({
			inputPath: "scaffold-processor/components/table/columns.tsx.hbs",
			outputPath: `components/${this.opts.table}/${this.opts.table}-columns.tsx`,
			data: {
				columnDefs: columnDefs,
				drizzleInferredType: capitalizedTableName,
				table: this.opts.table,
				isAdmin: this.opts.authorizationLevel === "admin",
			},
		});
	}
	getColumnDefObjs({ columnName }: GetColumnDefObjsOpts) {
		let code = "  {\n";
		code += `    accessorKey: "${columnName}",\n`;
		code += `    header: "${columnName}",\n`;
		code += "  },";
		return code;
	}
	addCreateForm(): void {
		const formControlsHtml = this.getFormControlsHtml();
		renderTemplate({
			inputPath: "scaffold-processor/components/table/create-form.tsx.hbs",
			outputPath: `components/${this.opts.table}/${this.opts.table}-create-form.tsx`,
			data: {
				table: this.opts.table,
				capitalizedTable: capitalize(this.opts.table),
				formControls: formControlsHtml,
			},
		});
	}
	getFormControlsHtml(): string {
		let html = "";
		for (const [index, column] of this.opts.columns.entries()) {
			const [columnName, dataType, arg1, arg2, arg3] = column.split(":");
			// TODO: validation should go earlier in process
			if (!(dataType in this.opts.dbDialectStrategy.dataTypeStrategyMap))
				throw new Error(`invalid data type strategy: ${dataType}`);
			const args = [arg1, arg2, arg3];
			if (this.includesItemThatStartsWithPk(args)) continue;
			if (this.includesItemThatStartsWithDefault(args)) continue;
			const dataTypeStrategy =
				this.opts.dbDialectStrategy.dataTypeStrategyMap[dataType];
			html += compileTemplate({
				inputPath: dataTypeStrategy.formTemplate,
				data: { column: columnName },
			});
			if (index !== this.opts.columns.length - 1) html += "\n";
		}
		return html;
	}
	addUpdateForm(): void {
		const formControlsHtml = this.getUpdateFormControlsHtml();
		renderTemplate({
			inputPath: "scaffold-processor/components/table/update-form.tsx.hbs",
			outputPath: `components/${this.opts.table}/${this.opts.table}-update-form.tsx`,
			data: {
				table: this.opts.table,
				capitalizedTable: capitalize(this.opts.table),
				formControls: formControlsHtml,
			},
		});
	}
	addDeleteForm(): void {
		renderTemplate({
			inputPath: "scaffold-processor/components/table/delete-form.tsx.hbs",
			outputPath: `components/${this.opts.table}/${this.opts.table}-delete-form.tsx`,
			data: {
				table: this.opts.table,
				capitalizedTable: capitalize(this.opts.table),
			},
		});
	}
	getUpdateFormControlsHtml(): string {
		let html = "";
		for (const [index, column] of this.opts.columns.entries()) {
			const [columnName, dataType, arg1, arg2, arg3] = column.split(":");
			if (!(dataType in this.opts.dbDialectStrategy.dataTypeStrategyMap))
				throw new Error(`invalid data type strategy: ${dataType}`);
			const args = [arg1, arg2, arg3];
			let updateFormTemplate = "";
			if (this.includesItemThatStartsWithPk(args)) {
				updateFormTemplate =
					"scaffold-processor/components/table/update-input-hidden.tsx.hbs";
			} else {
				const dataTypeStrategy =
					this.opts.dbDialectStrategy.dataTypeStrategyMap[dataType];
				updateFormTemplate = dataTypeStrategy.updateFormTemplate;
			}
			html += compileTemplate({
				inputPath: updateFormTemplate,
				data: { column: columnName },
			});
			if (index !== this.opts.columns.length - 1) html += "\n";
		}
		return html;
	}
	printCompletionMessage() {
		log.success(`scaffolding success: ${this.opts.table}`);
		log.reminder();
		log.cmd("npx drizzle-kit generate");
		log.cmd("npx drizzle-kit migrate");
	}
	commonFkArgHandler(args: string[]): string {
		return args
			.filter((arg) => !!arg)
			.filter((arg) => arg.startsWith("fk-"))
			.map((arg) => arg.split("-"))
			.map((arr) => arr[1])
			.map((str) => `.references(() => ${str})`)
			.join("");
	}
	includesItemThatStartsWithPk(arr: string[]) {
		for (const str of arr) {
			if (str === undefined) continue;
			if (str.startsWith("pk")) return true;
		}
		return false;
	}
	includesItemThatStartsWithDefault(arr: string[]) {
		for (const str of arr) {
			if (str === undefined) continue;
			if (str.startsWith("default-")) return true;
		}
		return false;
	}
	isFileType(arr: string[]) {
		return arr[1] === "file";
	}
	isImageType(arr: string[]) {
		return arr[1] === "image";
	}
	validateArg(arg: string): boolean {
		if (arg === undefined) {
			return true;
		}
		if (arg in this.commonArgMap) {
			return true;
		}
		if (arg in this.opts.dbDialectStrategy.dialectArgsMap) {
			return true;
		}
		if (arg.startsWith("fk-")) {
			return true;
		}
		return false;
	}
	validateArgs(args: string[]) {
		for (const arg of args) {
			if (!this.validateArg(arg)) {
				throw new Error(`invalid arg ${arg}`);
			}
		}
	}
	authorizationRouteGroup() {
		switch (this.opts.authorizationLevel) {
			case "admin":
				return "(admin)/admin/";
			case "private":
				return "(private)/";
			case "public":
				return "(public)/";
			default:
				throw new Error(
					`invalid authorization level ${this.opts.authorizationLevel}`,
				);
		}
	}
}
