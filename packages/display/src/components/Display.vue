<template>
  <div class="tce-root">
    <VExpansionPanels>
      <VExpandTransition group>
        <VExpansionPanel v-for="item in accordionItems" :key="item.id">
          <VExpansionPanelTitle>{{ item.header }}</VExpansionPanelTitle>
          <VExpansionPanelText>
            <VAlert v-if="!embeds[item.id].length" type="info" variant="tonal">
              No content elements added to this item.
            </VAlert>
            <TailorEmbeddedContainer v-else :elements="embeds[item.id]" />
          </VExpansionPanelText>
        </VExpansionPanel>
      </VExpandTransition>
    </VExpansionPanels>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ElementData } from '@tailor-cms/ce-accordion-manifest';
import reduce from 'lodash/reduce';
import sortBy from 'lodash/sortBy';

const props = defineProps<{ data: ElementData; userState: any }>();
defineEmits(['interaction']);

const accordionItems = computed(() => sortBy(props.data.items, 'position'));

const embeds = computed(() => {
  const { items, embeds } = props.data;
  return reduce(
    items,
    (acc, item) => {
      const itemEmbeds = Object.keys(item.body).map((id) => embeds[id]);
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
