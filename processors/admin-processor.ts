import { log } from '../lib/log';
import type { JustdrizProcessor, JustdrizProcessorOpts } from '../lib/types';
import { addJustDComponents, renderTemplate } from '../lib/utils';

export class AdminProcessor implements JustdrizProcessor {
  opts: JustdrizProcessorOpts;
  dependencies: string[] = [];
  devDependencies: string[] = [];
  justDComponents: string[] = ['card'];

  constructor(opts: JustdrizProcessorOpts) {
    this.opts = opts;
  }

  async init(): Promise<void> {
    await this.install();
    await this.render();
  }
  async install(): Promise<void> {
    if (!this.opts.install) {
      return;
    }

    await addJustDComponents({
      justDComponents: this.justDComponents,
      bun: this.opts.bun,
      pnpm: this.opts.pnpm,
    });
  }
  async render(): Promise<void> {
    renderTemplate({
      inputPath: 'admin-processor/app/(admin)/layout.tsx.hbs',
      outputPath: 'app/(admin)/layout.tsx.hbs',
    });

    renderTemplate({
      inputPath: 'admin-processor/app/(admin)/admin/page.tsx.hbs',
      outputPath: 'app/(admin)/admin/page.tsx',
    });

    renderTemplate({
      inputPath: 'admin-processor/app/admin-login/page.tsx.hbs',
      outputPath: 'app/(admin)/admin-login/page.tsx',
    });

    renderTemplate({
      inputPath: 'admin-processor/lib/authorization.ts.hbs',
      outputPath: 'lib/authorization.ts',
    });

    renderTemplate({
      inputPath: 'admin-processor/schema/role.ts.hbs',
      outputPath: 'schema/role.ts',
    });

    renderTemplate({
      inputPath: 'admin-processor/scripts/create-admin.ts.hbs',
      outputPath: 'scripts/create-admin.ts',
    });
  }

  printCompletionMessage() {
    log.white('\ncreate admin user:');
    log.cmd('npx tsx scripts/create-admin.ts admin@example.com password123');
  }
}
