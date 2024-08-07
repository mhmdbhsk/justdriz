export interface JustdrizProcessorOpts {
  pnpm: boolean;
  bun: boolean;
  install: boolean;
  latest: boolean;
}

export interface NewProjectProcessorOpts extends JustdrizProcessorOpts {
  darkMode: boolean;
  authEnabled: boolean;
  stripeEnabled: boolean;
}

export interface DbPackageStrategyOpts extends JustdrizProcessorOpts {}

export interface DarkModeProcessorOpts extends JustdrizProcessorOpts {}

export type PkStrategy = 'uuidv7' | 'uuidv4' | 'uuid' | 'auto-increment';

export interface StripeProcessorOpts extends JustdrizProcessorOpts {
  dbDialectStrategy: DbDialectStrategy;
  pkStrategy: PkStrategy;
}

export interface JustdrizProcessor {
  opts: JustdrizProcessorOpts;
  dependencies: string[];
  devDependencies: string[];
  justDComponents: string[];
  init(): Promise<void>;
  install(): Promise<void>;
  render(): Promise<void>;
}

export type DbDialect = 'postgresql' | 'mysql' | 'sqlite';

export interface ScaffoldOpts {
  table: string;
  columns: string[];
}

export interface DataTypeStrategyMap {
  [key: string]: DataTypeStrategy;
}

export type AuthorizationLevel = 'admin' | 'private' | 'public';

export interface ScaffoldProcessorOpts extends ScaffoldOpts {
  dbDialectStrategy: DbDialectStrategy;
  authorizationLevel: AuthorizationLevel;
}

export interface GetColumnDefObjsOpts {
  columnName: string;
}

export interface GetKeyValueStrForSchemaOpts extends ScaffoldProcessorOpts {
  column: string;
}

export interface DataTypeStrategyOpts {
  columnName: string;
}

type JSType = 'string' | 'number' | 'boolean' | 'object';

export interface DataTypeStrategy {
  jsType: JSType;
  formTemplate: string;
  updateFormTemplate: string;
  getKeyValueStrForSchema(opts: DataTypeStrategyOpts): string;
  getKeyValStrForFormData(opts: DataTypeStrategyOpts): string;
}

export interface DbDialectStrategy {
  dialect: DbDialect;
  schemaTableTemplatePath: string;
  drizzleDbCorePackage: string;
  tableConstructor: string;
  dataTypeStrategyMap: DataTypeStrategyMap;
  dialectArgsMap: { [key: string]: string };
  stripeSchemaTemplatePath: string;
  pkStrategyTemplates: Record<PkStrategy, string>;
  authSchemaTemplate: string;
  init(): void;
  copyDrizzleConfig(): void;
  copySchema(): void;
}

export interface DbPackageStrategy {
  opts: DbPackageStrategyOpts;
  dialect: DbDialect;
  dependencies: string[];
  devDependencies: string[];
  init(): Promise<void>;
  install(): Promise<void>;
  render(): Promise<void>;
  copyCreateUserScript(): void;
  copyMigrateScript(): void;
  appendDbUrl(): void;
  copyDbInstance(): void;
  copyDbInstanceForScripts(): void;
}

export type AuthProvider =
  | 'github'
  | 'google'
  | 'credentials'
  | 'postmark'
  | 'nodemailer';

export type SessionStrategy = 'jwt' | 'database';

export type DbPackage = 'pg' | 'mysql2' | 'better-sqlite3';
