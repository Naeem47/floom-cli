import { describe, expect, it } from 'vitest';
import { buildTemplateContext } from '../src/generators/template';
import { buildProjectContextFields } from '../src/generators/project-config';
import {
  formatSelectionLabel,
  getDefaultSelection,
  resolveTemplateSelection,
} from '../src/templates/registry';
import { loadManifest } from '../src/templates/registry';
import { DEFAULT_PROJECT_CONFIG } from '../src/types';

describe('template context', () => {
  it('builds context with placeholders and selection', () => {
    const selection = {
      architecture: 'clean-architecture' as const,
      state: 'riverpod' as const,
      networking: 'dio' as const,
      di: 'get_it' as const,
    };

    const context = {
      ...buildTemplateContext('MyApp', 'com.example', selection),
      ...buildProjectContextFields(selection, DEFAULT_PROJECT_CONFIG),
    };

    expect(context.projectName).toBe('MyApp');
    expect(context.networking).toBe('dio');
    expect(context.di).toBe('get_it');
    expect(context.primaryDesignWidth).toBe('375');
  });
});

describe('template registry', () => {
  it('loads manifest defaults', async () => {
    const manifest = await loadManifest();
    const defaults = getDefaultSelection(manifest);

    expect(defaults).toEqual({
      architecture: 'clean-architecture',
      state: 'riverpod',
      networking: 'dio',
      di: 'none',
    });
  });

  it('resolves legacy template presets', async () => {
    const selection = await resolveTemplateSelection({
      template: 'clean-riverpod',
    });

    expect(selection).toEqual({
      architecture: 'clean-architecture',
      state: 'riverpod',
      networking: 'none',
      di: 'none',
    });
  });

  it('formats selection label', () => {
    expect(
      formatSelectionLabel({
        architecture: 'mvc',
        state: 'bloc',
        networking: 'http',
        di: 'get_it',
      })
    ).toBe('mvc + bloc + http + get_it');

    expect(
      formatSelectionLabel(
        {
          architecture: 'clean-architecture',
          state: 'riverpod',
          networking: 'dio',
          di: 'none',
        },
        {
          devices: ['mobile'],
          assets: { enabled: true, folders: ['images'] },
          firebase: {
            enabled: true,
            services: ['auth', 'firestore'],
          },
        }
      )
    ).toBe('clean-architecture + riverpod + dio + none + firebase (auth, firestore)');
  });
});
