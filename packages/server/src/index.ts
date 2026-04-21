import { ai, initState, type } from '@tailor-cms/ce-accordion-manifest';
import type {
  BeforeDisplayHook,
  ElementHook,
  HookMap,
  OnUserInteractionHook,
  ServerModule,
} from '@tailor-cms/cek-common';
import type { Element } from '@tailor-cms/ce-accordion-manifest';

// Detect if hooks are running in CEK (used for mocking end-system runtime)
const IS_CEK = process.env.CEK_RUNTIME;
// Don't use in production, use only when IS_CEK=true
const USER_STATE: any = {};

export const beforeSave: ElementHook<Element> = (element) => element;

export const afterSave: ElementHook<Element> = (element) => element;

export const afterLoaded: ElementHook<Element> = (element) => element;

export const afterRetrieve: ElementHook<Element> = (element) => element;

export const beforeDisplay: BeforeDisplayHook<Element> = (_element, context) => {
  return { ...context, ...USER_STATE };
};

export const onUserInteraction: OnUserInteractionHook<Element> = (
  _element,
  context,
  payload,
) => {
  // Simulate user state update within CEK
  if (IS_CEK) {
    // Only for showcase purposes
    USER_STATE.interactionTimestamp = new Date().getTime();
    // Can be reset to initial / mocked state via UI
    context.contextTimestamp = USER_STATE.interactionTimestamp;
    Object.assign(USER_STATE, payload);
  }
  // Can have arbitrary return value (interpreted by target system)
  // FE is updated if updateDisplayState is true
  return { updateDisplayState: true };
};

export const hookMap: HookMap<Element> = new Map(
  Object.entries({
    beforeSave,
    afterSave,
    afterLoaded,
    afterRetrieve,
    onUserInteraction,
    beforeDisplay,
  }),
);

const serverModule: ServerModule<Element> = {
  type,
  initState,
  hookMap,
  beforeSave,
  afterSave,
  afterLoaded,
  afterRetrieve,
  onUserInteraction,
  beforeDisplay,
  ai,
};

export default serverModule;

export { type, initState, ai };
