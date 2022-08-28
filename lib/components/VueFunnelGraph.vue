<template>
  <div
    class="funnel svg-funnel-js"
    :class="{ 'svg-funnel-js--vertical': direction === 'vertical' }"
  >
    <div class="svg-funnel-js__container">
      <svg :width="width" :height="height">
        <defs>
          <linearGradient
            :id="'funnelGradient-' + (index + 1)"
            v-for="(colors, index) in gradientSet"
            :key="index"
            :gradientTransform="gradientAngle"
          >
            <stop
              :stop-color="color"
              :offset="offsetColor(index, colors.values.length)"
              v-for="(color, index) in colors.values"
              :key="index"
            ></stop>
          </linearGradient>
        </defs>
        <path
          :fill="colorSet[index].fill"
          :stroke="colorSet[index].fill"
          :d="path"
          v-for="(path, index) in paths"
          :key="index"
        ></path>
      </svg>
    </div>
    <transition-group
      class="svg-funnel-js__labels"
      name="appear"
      tag="div"
      v-on:enter="onTransition"
      v-on:leave="onTransition"
    >
      <div
        class="svg-funnel-js__label"
        :class="'label-' + (index + 1)"
        v-for="(value, index) in valuesFormatted"
        :key="labels[index].toLowerCase().split(' ').join('-')"
      >
        <div class="label__value">{{ value }}</div>
        <div class="label__title" v-if="labels">{{ labels[index] }}</div>
        <div
          class="label__percentage"
          v-if="displayPercentage && percentages()[index] !== 100"
        >
          {{ percentages()[index] }}%
        </div>
        <div class="label__segment-percentages" v-if="is2d()">
          <ul class="segment-percentage__list">
            <li v-for="(subLabel, j) in subLabels" :key="j">
              {{ subLabel }}:
              <span class="percentage__list-label"
                >{{ twoDimPercentages()[index][j] }}%</span
              >
            </li>
          </ul>
        </div>
      </div>
    </transition-group>
    <transition name="fade" v-on:enter="onTransition" v-on:leave="onTransition">
      <div class="svg-funnel-js__subLabels" v-if="is2d()">
        <div
          :class="
            'svg-funnel-js__subLabel svg-funnel-js__subLabel-' + (index + 1)
          "
          v-for="(subLabel, index) in subLabels"
          :key="index"
        >
          <div
            class="svg-funnel-js__subLabel--color"
            :style="subLabelBackgrounds(index)"
          ></div>
          <div class="svg-funnel-js__subLabel--title">{{ subLabel }}</div>
        </div>
      </div>
    </transition>
  </div>
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

onBeforeMount(() => {
  graph.value = new VueFunnelGraph({
    height: props.height,
    width: props.width,
    direction: props.direction,
    data: {
      labels: props.labels,
      values: props.values,
    },
  });

  drawPaths();
});
</script>

<style>
.svg-funnel-js {
  display: inline-block;
  position: relative;
}
.svg-funnel-js svg {
  display: block;
}
.svg-funnel-js .svg-funnel-js__labels {
  position: absolute;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}
.svg-funnel-js.svg-funnel-js--vertical .svg-funnel-js__labels {
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -ms-flex-direction: column;
  flex-direction: column;
}

.svg-funnel-js {
  font-family: Open Sans, sans-serif;
}
.svg-funnel-js .svg-funnel-js__container {
  width: 100%;
  height: 100%;
}
.svg-funnel-js .svg-funnel-js__labels {
  width: 100%;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}
.svg-funnel-js .svg-funnel-js__labels .svg-funnel-js__label {
  -webkit-box-flex: 1;
  -ms-flex: 1 1 0px;
  flex: 1 1 0;
  position: relative;
}
.svg-funnel-js .svg-funnel-js__labels .svg-funnel-js__label .label__value {
  font-size: 24px;
  line-height: 18px;
  margin-bottom: 6px;
}
.svg-funnel-js .svg-funnel-js__labels .svg-funnel-js__label .label__title {
  font-size: 12px;
  font-weight: 700;
  color: #21ffa2;
}
.svg-funnel-js .svg-funnel-js__labels .svg-funnel-js__label .label__percentage {
  font-size: 16px;
  font-weight: 700;
  color: #9896dc;
}
.svg-funnel-js
  .svg-funnel-js__labels
  .svg-funnel-js__label
  .label__segment-percentages {
  position: absolute;
  top: 50%;
  -webkit-transform: translateY(-50%);
  transform: translateY(-50%);
  width: 100%;
  left: 0;
  padding: 8px 24px;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  background-color: rgba(8, 7, 48, 0.8);
  margin-top: 24px;
  opacity: 0;
  -webkit-transition: opacity 0.1s ease;
  transition: opacity 0.1s ease;
  cursor: default;
}
.svg-funnel-js
  .svg-funnel-js__labels
  .svg-funnel-js__label
  .label__segment-percentages
  ul {
  margin: 0;
  padding: 0;
  list-style-type: none;
}
.svg-funnel-js
  .svg-funnel-js__labels
  .svg-funnel-js__label
  .label__segment-percentages
  ul
  li {
  font-size: 13px;
  line-height: 16px;
  color: #fff;
  margin: 18px 0;
}
.svg-funnel-js
  .svg-funnel-js__labels
  .svg-funnel-js__label
  .label__segment-percentages
  ul
  li
  .percentage__list-label {
  font-weight: 700;
  color: #05df9d;
}
.svg-funnel-js
  .svg-funnel-js__labels
  .svg-funnel-js__label:hover
  .label__segment-percentages {
  opacity: 1;
}
.svg-funnel-js:not(.svg-funnel-js--vertical) {
  padding-top: 64px;
  padding-bottom: 16px;
}
.svg-funnel-js:not(.svg-funnel-js--vertical) .svg-funnel-js__label {
  padding-left: 24px;
}
.svg-funnel-js:not(.svg-funnel-js--vertical)
  .svg-funnel-js__label:not(:first-child) {
  border-left: 1px solid #9896dc;
}
.svg-funnel-js.svg-funnel-js--vertical {
  padding-left: 120px;
  padding-right: 16px;
}
.svg-funnel-js.svg-funnel-js--vertical .svg-funnel-js__label {
  padding-top: 24px;
}
.svg-funnel-js.svg-funnel-js--vertical .svg-funnel-js__label:not(:first-child) {
  border-top: 1px solid #9896dc;
}
.svg-funnel-js.svg-funnel-js--vertical
  .svg-funnel-js__label
  .label__segment-percentages {
  margin-top: 0;
  margin-left: 106px;
  width: calc(100% - 106px);
}
.svg-funnel-js.svg-funnel-js--vertical
  .svg-funnel-js__label
  .label__segment-percentages
  .segment-percentage__list {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -ms-flex-pack: distribute;
  justify-content: space-around;
}
.svg-funnel-js .svg-funnel-js__subLabels {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  justify-content: center;
  margin-top: 24px;
  position: absolute;
  width: 100%;
  left: 0;
}
.svg-funnel-js .svg-funnel-js__subLabels .svg-funnel-js__subLabel {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  font-size: 12px;
  line-height: 16px;
}
.svg-funnel-js
  .svg-funnel-js__subLabels
  .svg-funnel-js__subLabel:not(:first-child) {
  margin-left: 16px;
}
.svg-funnel-js
  .svg-funnel-js__subLabels
  .svg-funnel-js__subLabel
  .svg-funnel-js__subLabel--color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin: 2px 8px 2px 0;
}
</style>
