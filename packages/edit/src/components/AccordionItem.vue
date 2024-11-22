<template>
  <VExpansionPanel :hide-actions="isNew" :readonly="isNew" :value="item.id">
    <VHover v-slot="{ isHovering, props: hoverProps }">
      <VExpansionPanelTitle
        v-bind="hoverProps"
        class="pa-2 pr-4"
        color="primary-lighten-5"
        min-height="56"
      >
        <VForm
          ref="form"
          class="d-flex align-center w-100"
          validate-on="submit"
          @submit.prevent="saveTitle"
        >
          <span
            v-if="!isDisabled"
            class="accordion-drag-handle"
            @drag.stop.prevent
          >
            <VIcon icon="mdi-drag-vertical" />
          </span>
          <VTextField
            v-if="isEditing"
            v-model="title"
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
          <div v-else class="accordion-title ml-4">{{ item.title }}</div>
          <VSpacer />
          <div v-if="!isDisabled" class="d-flex mx-2 ga-1">
            <template v-if="isEditing">
              <VBtn
                color="primary-darken-2"
                text="Save"
                type="submit"
                variant="tonal"
                @click.stop
              />
              <VBtn
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
                  density="comfortable"
                  icon="mdi-square-edit-outline"
                  variant="tonal"
                  @click.stop="isEditing = true"
                />
                <VBtn
                  v-tooltip:bottom="{ text: 'Delete item', openDelay: 300 }"
                  color="secondary-lighten-2"
                  density="comfortable"
                  icon="mdi-delete-outline"
                  variant="tonal"
                  @click.stop="deleteItem"
                />
              </template>
            </VFadeTransition>
          </div>
        </VForm>
      </VExpansionPanelTitle>
    </VHover>
    <VExpansionPanelText class="text-center">
      <VAlert
        v-if="!hasElements"
        color="primary-darken-2"
        icon="mdi-information-variant"
        variant="tonal"
        prominent
      >
        <template v-if="isDisabled">
          No content elements added to this item.
        </template>
        <template v-else>
          Click the button below to add content element.
        </template>
      </VAlert>
      <EmbeddedContainer
        :container="{ embeds }"
        :is-disabled="isDisabled"
        :types="embedTypes"
        @delete="deleteEmbed"
        @save="saveEmbed($event.embeds)"
      />
    </VExpansionPanelText>
  </VExpansionPanel>
</template>

<script lang="ts" setup>
import { computed, inject, ref } from 'vue';
import cloneDeep from 'lodash/cloneDeep';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import pull from 'lodash/pull';

interface Props {
  item: any;
  embedTypes: string[];
  embeds?: any;
  isFocused?: boolean;
  isDisabled?: boolean;
  isExpanded?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  embeds: () => {},
  isDisabled: false,
  isFocused: false,
  isExpanded: false,
});
const emit = defineEmits(['save', 'expand', 'delete']);

const eventBus = inject('$eventBus') as any;

const isEditing = ref(!props.item.title);
const form = ref<HTMLFormElement>();
const title = ref(props.item.title);

const isNew = computed(() => !props.item.title);
const hasElements = computed(() => !isEmpty(props.embeds));

const cancel = () => {
  if (isNew.value) return emit('delete');
  title.value = props.item.title;
  isEditing.value = false;
};

const saveTitle = async () => {
  const { valid } = await form.value?.validate();
  if (!valid) return;
  isEditing.value = false;
  const item = { ...props.item, title: title.value };
  emit('save', { item, embeds: props.embeds });
  if (isNew.value) emit('expand');
};

const saveEmbed = (embeds: any) => {
  const item = cloneDeep(props.item);
  item.elementIds = map(embeds, 'id');
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
  pull(item.elementIds, embed.id);
  emit('save', { item, embeds });
};
</script>

<style lang="scss" scoped>
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
