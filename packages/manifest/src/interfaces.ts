import type * as common from '@tailor-cms/cek-common';
export interface AccordionItem {
  id: string;
  header: string;
  body: Record<string, any>;
  position: number;
}

export interface ElementData extends common.ElementConfig {
  embeds: Record<string, any>;
  items: Record<string, AccordionItem>;
}

export type DataInitializer = common.DataInitializer<ElementData>;
export type Element = common.Element<ElementData>;
export type ElementManifest = common.ElementManifest<ElementData>;
