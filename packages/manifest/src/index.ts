import { OpenAISchema } from '@tailor-cms/cek-common';
import { v4 as uuid } from 'uuid';

import type {
  DataInitializer,
  ElementData,
  ElementManifest,
} from './interfaces';

const id1 = uuid();
const id2 = uuid();

// Element unique id within the target system (e.g. Tailor)
export const type = 'ACCORDION';

// Display name (e.g. shown to the author)
export const name = 'Accordion';

// Function which inits element state (data property on the Content Element
// entity)
export const initState: DataInitializer = (): ElementData => ({
  embeds: {},
  items: {
    [id1]: {
      id: id1,
      header: 'Accordion Item Title',
      body: {},
      position: 1,
    },
    [id2]: {
      id: id2,
      header: 'Accordion Item Title',
      body: {},
      position: 1,
    },
  },
});

// Can be loaded from package.json
export const version = '1.0';

// UI configuration for Tailor CMS
const ui = {
  // Display icon, https://pictogrammers.com/library/mdi/
  icon: 'mdi-view-day',
  // Does element support only full width or can be used within layouts
  // (e.g. 50/50 layout)
  forceFullWidth: true,
};

export const ai = {
  Schema: {
    type: 'json_schema',
    name: 'ce_accordion',
    schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          minItems: 2,
          items: {
            type: 'object',
            properties: {
              header: { type: 'string' },
              content: { type: 'string' },
            },
            required: ['header', 'content'],
            additionalProperties: false,
          },
        },
      },
      required: ['items'],
      additionalProperties: false,
    },
  } as OpenAISchema,
  getPrompt: () => `
    Generate a accordion content element as an object with the following
    properties:
    {
      "items": [
        {
          "header": "",
          "content": ""
        }
      ]
    }
    where:
      - 'items' is an array of accordion item objects where:
        - 'header' is the title of the accordion item.
        - 'content' is the text to be displayed in the accordion item.
          The content should be relevant to the topic of the accordion and
          have a few paragraphs about the topic.
  `,
  processResponse: (val: any) => {
    return val.items.reduce(
      (
        acc: Record<string, any>,
        { header, content }: { header: string; content: string },
        index: number,
      ) => {
        const embedId = uuid();
        const itemId = uuid();
        acc.embeds[embedId] = {
          id: embedId,
          data: { content },
          embedded: true,
          position: 1,
          type: 'TIPTAP_HTML',
        };
        acc.items[itemId] = {
          id: itemId,
          body: { [embedId]: true },
          header,
          position: index + 1,
        };
        return acc;
      },
      { items: {}, embeds: {} },
    );
  },
};

const manifest: ElementManifest = {
  type,
  version: '1.0',
  name,
  isComposite: true,
  ssr: false,
  initState,
  ui,
  ai,
};

export default manifest;
export * from './interfaces';
