<template>
  <div>Lorem ipsum dolor sit amet.</div>
</template>

<script setup>
import { ref } from "vue";
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

const graph = ref(null);
const paths = ref([]);
const prevPaths = ref([]);
const defaultColors = ref(getDefaultColors(10));

const is2d = () => {
  if (graph.value?.is2d) return graph.value.is2d();
  throw new TypeError("Variable graph is not instance of VueFunnelGraph");
};

const getPathDefinitions = () => {
  if (graph.value?.getPathDefinitions) return graph.value.getPathDefinitions();
  throw new TypeError("Variable graph is not instance of VueFunnelGraph");
};

const getValues2d = () => {
  if (graph.value?.getValues2d) return graph.value.getValues2d();
  throw new TypeError("Variable graph is not instance of VueFunnelGraph");
};

const percentages = () => {
  if (graph.value?.createPercentages) return graph.value.createPercentages();
  throw new TypeError("Variable graph is not instance of VueFunnelGraph");
};

const twoDimPercentages = () => {
  if (!is2d()) return [];
  if (graph.value?.getPercentages2d) return graph.value.getPercentages2d();
  throw new TypeError("Variable graph is not instance of VueFunnelGraph");
};

const subLabelBackgrounds = (index) => {
  if (!is2d()) return [];
  return generateLegendBackground(
    getColors.value[index],
    props.gradientDirection
  );
};

const offsetColor = (index, length) => {
  return `${Math.round((100 * index) / (length - 1))}%`;
};

const onTransition = (el, done) => {
  if (!done) return;
  if (!props.animated) done();
  setTimeout(() => done(), 700);
};
</script>
