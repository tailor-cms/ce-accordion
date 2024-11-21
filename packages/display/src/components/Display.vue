<template>
  <div class="tce-root">
    <VExpansionPanels>
      <VExpandTransition group>
        <VExpansionPanel v-for="item in data.items" :key="item.id">
          <VExpansionPanelTitle>{{ item.title }}</VExpansionPanelTitle>
          <VExpansionPanelText>
            <VAlert v-if="!embeds[item.id].length" type="info" variant="tonal">
              No content elements added to this item.
            </VAlert>
            <EmbeddedContainer v-else :elements="embeds[item.id]" />
          </VExpansionPanelText>
        </VExpansionPanel>
      </VExpandTransition>
    </VExpansionPanels>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ElementData } from '@tailor-cms/ce-accordion-manifest';
import sortBy from 'lodash/sortBy';

const props = defineProps<{ data: ElementData; userState: any }>();
defineEmits(['interaction']);

const embeds = computed(() => {
  const { items, embeds } = props.data;
  return items.reduce(
    (acc, item) => {
      const itemEmbeds = item.elementIds.map((id) => embeds[id]);
      acc[item.id] = sortBy(itemEmbeds, 'position');
      return acc;
    },
    {} as Record<string, any[]>,
  );
});
</script>

<style scoped>
.tce-root {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 1rem;
}
</style>
