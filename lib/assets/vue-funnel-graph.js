import "./funnel-graph.min.js";

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

export { VueFunnelGraph };
