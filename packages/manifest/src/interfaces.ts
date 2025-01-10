interface AccordionItem {
  id: string;
  title: string;
  elementIds: string[];
}

export interface ElementData {
  embeds: Record<string, any>;
  items: AccordionItem[];
}

export interface Element {
  id: number;
  uid: string;
  activityId: number;
  repositoryId: number;
  contentId: string;
  contentSignature: string;
  type: string;
  position: number;
  data: ElementData;
  meta: { [key: string]: unknown };
  refs: { [key: string]: unknown };
  linked: boolean;
  detached: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export type DataInitializer = () => ElementData;

export interface ElementManifest {
  type: string;
  version: string;
  name: string;
  ssr: boolean;
  isComposite: boolean;
  initState: DataInitializer;
  Edit?: object;
  TopToolbar?: object;
  SideToolbar?: object;
  Display?: object;
  ui: {
    icon: string;
    forceFullWidth: boolean;
  };
  mocks?: {
    displayContexts: Array<{ name: string; data: any }>;
  };
}
