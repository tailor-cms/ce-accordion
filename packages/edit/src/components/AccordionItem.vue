<template>
  <VExpansionPanel>
    <VExpansionPanelTitle color="primary-lighten-5" min-height="68">
      <VTextField
        v-if="isEditingHeader"
        v-model="header"
        @click.stop
        @keyup.space.prevent
        class="w-100"
        variant="filled"
        density="compact"
        hide-details
        autofocus
      />
      <div v-else class="pl-3">{{ item.header }}</div>
      <VSpacer />
      <div v-if="!isDisabled" class="d-flex mx-4">
        <template v-if="isEditingHeader">
          <VBtn
            color="primary-darken-2"
            density="comfortable"
            icon="mdi-check"
            variant="text"
            @click.stop="saveHeader"
          />
          <VBtn
            color="primary-darken-2"
            density="comfortable"
            icon="mdi-close"
            variant="text"
            @click.stop="isEditingHeader = false"
          />
        </template>
        <template v-else>
          <VBtn
            v-tooltip="'Edit heading'"
            color="primary-darken-2"
            density="comfortable"
            icon="mdi-pencil"
            variant="text"
            @click.stop="editHeader"
          />
          <VBtn
            v-tooltip="'Delete item'"
            color="primary-darken-2"
            density="comfortable"
            icon="mdi-delete"
            variant="text"
            @click.stop="deleteItem"
          />
        </template>
      </div>
    </VExpansionPanelTitle>
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
        :types="embedTypes"
        :container="{ embeds }"
        :is-disabled="isDisabled"
        @delete="deleteEmbed"
        @save="save(item, $event)"
      />
    </VExpansionPanelText>
  </VExpansionPanel>
</template>

<script lang="ts" setup>
import { ref, computed, inject } from 'vue';
import { cloneDeep, forEach, isEmpty } from 'lodash';

interface Props {
  item: any;
  embedTypes?: string[] | undefined;
  embeds?: any;
  isFocused?: boolean;
  isDisabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  embeds: () => {},
  isDisabled: false,
});
const emit = defineEmits(['save', 'delete']);

const eventBus = inject('$eventBus') as any;

const header = ref(props.item.header);
const isEditingHeader = ref(false);

const hasElements = computed(() => !isEmpty(props.embeds));

const editHeader = () => {
  isEditingHeader.value = true;
  header.value = props.item.header;
};

const saveHeader = () => {
  isEditingHeader.value = false;
  save({ ...props.item, header: header.value }, props.embeds);
};

const save = (item: any, { embeds }: any) => {
  item = cloneDeep(item);
  forEach(embeds, (it) => (item.body[it.id] = true));
  console.log('###',  { item, embeds });
  emit('save', { item, embeds });
};

const deleteItem = () => {
  return eventBus.emit('showConfirmationModal', {
    title: 'Delete accordion item',
    message: 'Are you sure you want to delete selected item?',
    action: () =>  emit('delete'),
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
