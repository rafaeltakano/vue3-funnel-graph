<template>
  <div>Lorem ipsum dolor sit amet.</div>
</template>

<script setup>
import {
  formatNumber,
  getDefaultColors,
  generateLegendBackground,
  VueFunnelGraph,
} from "../assets/vue-funnel-graph";

const props = defineProps({
  height: {
    type: [Number, String],
    default: 300,
  },
  width: {
    type: [Number, String],
    default: 800,
  },
  colors: {
    type: Array,
    default: [],
  },
  labels: {
    type: Array,
    default: [],
  },
  subLabels: {
    type: Array,
    default: [],
  },
  values: {
    type: Array,
    default: [],
  },
  direction: {
    type: String,
    default: "horizontal",
  },
  gradientDirection: {
    type: String,
    default: "horizontal",
  },
  animated: {
    type: Boolean,
    default: false,
  },
  displayPercentage: {
    type: Boolean,
    default: true,
  },
});
</script>
