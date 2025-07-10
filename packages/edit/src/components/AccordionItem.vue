<template>
  <VExpansionPanel :value="item.id">
    <VHover v-slot="{ isHovering, props: hoverProps }">
      <VExpansionPanelTitle
        v-bind="hoverProps"
        class="pa-2 pr-4"
        color="primary-lighten-5"
        min-height="64"
      >
        <VForm
          ref="form"
          class="d-flex align-center w-100"
          validate-on="submit"
          @submit.prevent="saveHeader"
        >
          <span
            v-if="!isReadonly"
            class="accordion-drag-handle"
            @drag.stop.prevent
          >
            <VIcon icon="mdi-drag-vertical" />
          </span>
          <VTextField
            v-if="isEditing"
            v-model="header"
            :rules="[(val: string) => !!val || 'Title is required']"
            bg-color="white"
            class="w-100"
            density="compact"
            hide-details="auto"
            placeholder="Accordion item title..."
            variant="outlined"
            @click.stop
            @keyup.space.prevent
          />
          <div v-else class="accordion-title ml-4">{{ item.header }}</div>
          <VSpacer />
          <div v-if="!isReadonly" class="d-flex mx-2 ga-1">
            <template v-if="isEditing">
              <VBtn
                :disabled="header === props.item.header"
                color="primary-darken-2"
                text="Save"
                type="submit"
                variant="tonal"
                @click.stop
              />
              <VBtn
                :disabled="!props.item.header"
                color="primary-darken-2"
                text="Cancel"
                variant="text"
                @click.stop="cancel"
              />
            </template>
            <VFadeTransition v-else group>
              <template v-if="isHovering || isExpanded">
                <VBtn
                  v-tooltip:bottom="{ text: 'Edit title', openDelay: 300 }"
                  color="primary-darken-2"
                  size="x-small"
                  variant="tonal"
                  icon
                  @click.stop="isEditing = true"
                >
                  <VIcon icon="mdi-square-edit-outline" size="large" />
                </VBtn>
                <VBtn
                  v-if="allowDeletion"
                  v-tooltip:bottom="{ text: 'Delete item', openDelay: 300 }"
                  color="secondary-lighten-1"
                  size="x-small"
                  variant="tonal"
                  icon
                  @click.stop="deleteItem"
                >
                  <VIcon icon="mdi-delete-outline" size="large" />
                </VBtn>
              </template>
            </VFadeTransition>
          </div>
        </VForm>
      </VExpansionPanelTitle>
    </VHover>
    <VExpansionPanelText class="text-center">
      <VAlert
        v-if="!hasElements"
        class="mx-6 mt-4 mb-2"
        color="primary-darken-1"
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
        :is-disabled="isReadonly"
        @delete="deleteEmbed"
        @save="saveEmbed($event.embeds)"
      />
    </VExpansionPanelText>
  </VExpansionPanel>
</template>

<script lang="ts" setup>
import { cloneDeep, forEach, isEmpty } from 'lodash-es';
import { computed, inject, ref } from 'vue';
import { AccordionItem } from '@tailor-cms/ce-accordion-manifest';

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
const emit = defineEmits(['save', 'delete']);

const eventBus = inject('$eventBus') as any;

const isEditing = ref(!props.item.header);
const form = ref<HTMLFormElement>();
const header = ref(props.item.header);

const hasElements = computed(() => !isEmpty(props.embeds));

const cancel = () => {
  header.value = props.item.header;
  isEditing.value = false;
};

const saveHeader = async () => {
  const { valid } = await form.value?.validate();
  if (!valid) return;
  isEditing.value = false;
  const item = { ...props.item, header: header.value };
  emit('save', { item, embeds: props.embeds });
};

const saveEmbed = (embeds: any) => {
  const item = cloneDeep(props.item);
  forEach(embeds, (it) => (item.body[it.id] = true));
  emit('save', { item, embeds });
};

const deleteItem = () => {
  return eventBus.channel('app').emit('showConfirmationModal', {
    title: 'Delete accordion item',
    message: 'Are you sure you want to delete selected item?',
    action: () => emit('delete'),
  });
};

const deleteEmbed = (embed: { id: string }) => {
  const embeds = cloneDeep(props.embeds);
  const item = cloneDeep(props.item);
  delete embeds[embed.id];
  delete item.body[embed.id];
  emit('save', { item, embeds });
};
</script>

<style lang="scss" scoped>
.v-expansion-panel {
  border: thin solid rgba(0, 0, 0, 0.12);
}

.accordion-title {
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: 0.009375em;
}

.v-input {
  position: relative;

  :deep(.v-input__details) {
    position: absolute;
    padding: 0 !important;
    z-index: 9;

    .v-messages__message {
      margin-top: 0.25rem;
      border-radius: 4px;
      padding: 0.5rem 0.75rem;
      background: #424242;
      color: #fff !important;
    }
  }
}
</style>
