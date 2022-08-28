<template>
  <div>Lorem ipsum dolor sit amet.</div>
</template>

<script setup>
import { ref, toRaw, computed, onBeforeMount, watch } from "vue";
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

const drawPaths = () => {
  prevPaths.value = paths.value;
  paths.value = [];
  const definitions = getPathDefinitions();

  definitions.forEach((d) => {
    paths.value.push(d);
  });
};

const getColors = computed(() => {
  const colors = toRaw(props.colors);
  const defcolors = toRaw(defaultColors.value);

  if (colors instanceof Array && colors.length === 0)
    return getDefaultColors(is2d() ? props.values.length : 2);

  if (colors.length < paths.value.length)
    return colors.concat(
      [...defcolors].splice(
        paths.value.length,
        paths.value.length - colors.length
      )
    );

  return colors;
});

const colorSet = computed(() => {
  const scopeSet = [];
  let gradientCount = 0;

  paths.value.map((v, i) => {
    const values = is2d() ? getColors.value[i] : getColors.value;
    const solid = typeof values === "string" || values.length === 1;
    const fillMode = solid ? "solid" : "gradient";

    if (!solid) gradientCount += 1;

    scopeSet.push({
      values,
      fillMode,
      fill: solid ? values : `url('#funnelGradient-${gradientCount}')`,
    });
  });

  return scopeSet;
});

const gradientSet = computed(() => {
  const scopeSet = [];

  colorSet.value.map((colors) => {
    if (colors.fillMode === "gradient") scopeSet.push(colors);
  });

  return scopeSet;
});

const gradientAngle = computed(() => {
  return `rotate(${props.gradientDirection === "vertical" ? 90 : 0})`;
});

const valuesFormatted = computed(() => {
  if (is2d()) {
    const values2d = getValues2d();
    return values2d.map((value) => formatNumber(value));
  }
  const values3d = toRaw(props.values).map((value) => formatNumber(value));
  return values3d;
});

watch(
  () => props.values,
  () => {
    if (graph.value?.setValues) {
      graph.value.setValues(toRaw(props.values));
      return drawPaths();
    }
    throw new TypeError("Variable graph is not instance of VueFunnelGraph");
  }
);

watch(
  () => props.direction,
  () => {
    if (
      graph.value?.setDirection &&
      graph.value?.setWidth &&
      graph.value?.setHeight
    ) {
      graph.value
        .setDirection(props.direction)
        .setWidth(props.width)
        .setHeight(props.height);
      return drawPaths();
    }
    throw new TypeError("Variable graph is not instance of VueFunnelGraph");
  }
);
</script>
