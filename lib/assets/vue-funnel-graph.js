import "./funnel-graph.min.js";

const defaultColors = [
  "#FF4589",
  "#FF5050",
  "#05DF9D",
  "#4FF2FD",
  "#2D9CDB",
  "#A0BBFF",
  "#FFD76F",
  "#F2C94C",
  "#FF9A9A",
  "#FFB178",
];

const getDefaultColors = (number) => {
  const colors = [...defaultColors];
  const colorSet = [];

  for (let i = 0; i < number; i++) {
    // get a random color
    const index = Math.abs(Math.round(Math.random() * (colors.length - 1)));
    // push it to the list
    colorSet.push(colors[index]);
    // and remove it, so that it is not chosen again
    colors.splice(index, 1);
  }

  return colorSet;
};

const generateLegendBackground = (color, direction = "horizontal") => {
  if (typeof color === "string") {
    return `background-color: ${color}`;
  }

  if (color.length === 1) {
    return `background-color: ${color[0]}`;
  }

  return `background-image: linear-gradient(${
    direction === "horizontal" ? "to right, " : ""
  }${color.join(", ")})`;
};

const formatNumber = (number) => {
  return Number(number)
    .toString()
    .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
};

const getFunnelGraph = () => {
  try {
    if (FunnelGraph) return FunnelGraph;
    throw new Error("Missing dependency funnel-graph.min.js");
  } catch (e) {
    console.error(e);
    return null;
  }
};

const VueFunnelGraph = getFunnelGraph();

export {
  formatNumber,
  getDefaultColors,
  generateLegendBackground,
  VueFunnelGraph,
};
