<template>
  <div class="tce-root">
    <VExpansionPanels>
      <VExpansionPanel v-for="item in data.items" :key="item.id">
        <VExpansionPanelTitle>{{ item.header }}</VExpansionPanelTitle>
        <VExpansionPanelText>
          <EmbeddedContainer :elements="getElements(item, data.embeds)" />
        </VExpansionPanelText>
      </VExpansionPanel>
    </VExpansionPanels>
  </div>
</template>

<script setup lang="ts">
import { ElementData } from '@tailor-cms/ce-accordion-manifest';
import map from 'lodash/map';
import sortBy from 'lodash/sortBy';

function getElements(item: any, embeds: any) {
  const elements = map(item.body, (_, id) => embeds[id]);
  return sortBy(elements, 'position');
}

defineProps<{ data: ElementData; userState: any }>();
defineEmits(['interaction']);
</script>

<style scoped>
.tce-root {
  background-color: transparent;
  margin-top: 1rem;
  padding: 1.25rem;
  border: 2px dashed #888;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 1rem;
}
</style>
