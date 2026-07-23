<!-- eslint-disable vue/no-undef-components -->
<template>
  <VExpansionPanel :value="item.id">
    <VHover v-slot="{ isHovering, props: hoverProps }">
      <VExpansionPanelTitle
        v-bind="hoverProps"
        class="pa-2 pr-4"
        min-height="56"
      >
        <div class="d-flex align-center w-100 ga-2">
          <span
            v-if="!isReadonly"
            class="accordion-drag-handle"
            @drag.stop.prevent
          >
            <VIcon icon="mdi-drag-vertical" />
          </span>
          <VTextField
            v-model="draft.header"
            :readonly="isReadonly"
            bg-color="transparent"
            class="accordion-item-title"
            density="compact"
            placeholder="Accordion Title"
            variant="plain"
            flat
            hide-details
            @blur="save.flush()"
            @click.stop
            @keyup.space.prevent
            @update:model-value="save"
          />
          <VFadeTransition>
            <VBtn
              v-if="(isHovering || isExpanded) && !isReadonly && allowDeletion"
              v-tooltip:bottom="{ text: 'Delete item', openDelay: 300 }"
              aria-label="Delete item"
              class="mr-2"
              color="error"
              density="comfortable"
              icon="mdi-trash-can-outline"
              size="small"
              variant="tonal"
              @click.stop="deleteItem"
            />
          </VFadeTransition>
        </div>
      </VExpansionPanelTitle>
    </VHover>
    <VExpansionPanelText class="text-center">
      <VAlert
        v-if="!hasElements"
        class="mx-6 mt-4 mb-2"
        icon="mdi-information-outline"
        variant="tonal"
        prominent
      >
        <template v-if="isReadonly">
          No content elements added to this item.
        </template>
        <template v-else>
          Click the button below to add content element.
        </template>
      </VAlert>
      <TailorEmbeddedContainer
        :allowed-element-config="embedElementConfig"
        :container="{ embeds }"
        :is-readonly="isReadonly"
        @delete="deleteEmbed"
        @save="saveEmbed($event.embeds)"
      />
    </VExpansionPanelText>
  </VExpansionPanel>
</template>

<script lang="ts" setup>
import { cloneDeep, debounce, forEach, isEmpty } from 'lodash-es';
import { computed, inject, reactive } from 'vue';
import { AccordionItem } from '@tailor-cms/ce-accordion-manifest';

const SAVE_DEBOUNCE = 3000;

interface Embed {
  id: string;
  data: Record<string, any>;
  embedded: boolean;
  position: number;
  type: string;
}

interface Props {
  allowDeletion: boolean;
  item: AccordionItem;
  embedElementConfig: any[];
  embeds?: Record<string, Embed>;
  isFocused?: boolean;
  isReadonly?: boolean;
  isExpanded?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  embeds: () => ({}),
  isReadonly: false,
  isFocused: false,
  isExpanded: false,
});
const emit = defineEmits<{
  save: [payload: { item: AccordionItem; embeds?: Record<string, Embed> }];
  delete: [];
}>();

const eventBus = inject('$eventBus') as any;

const draft = reactive({ header: props.item.header });

const hasElements = computed(() => !isEmpty(props.embeds));

const currentItem = (): AccordionItem => ({
  ...cloneDeep(props.item),
  ...draft,
});

const save = debounce(() => {
  emit('save', { item: currentItem(), embeds: props.embeds });
}, SAVE_DEBOUNCE);

const saveEmbed = (embeds: Record<string, Embed>) => {
  const item = currentItem();
  forEach(embeds, (it) => (item.body[it.id] = true));
  emit('save', { item, embeds });
};

const deleteEmbed = (embed: { id: string }) => {
  const item = currentItem();
  const embeds = cloneDeep(props.embeds);
  delete embeds[embed.id];
  delete item.body[embed.id];
  emit('save', { item, embeds });
};

const deleteItem = () => {
  return eventBus.channel('app').emit('showConfirmationModal', {
    title: 'Delete accordion item',
    message: 'Are you sure you want to delete selected item?',
    action: () => emit('delete'),
  });
};
</script>

<style lang="scss" scoped>
.v-expansion-panel {
  border: thin solid rgba(0, 0, 0, 0.12);
}

.accordion-drag-handle {
  cursor: pointer;
}

.accordion-item-title:deep(.v-field) {
  --v-field-input-padding-top: 0;
}
</style>
