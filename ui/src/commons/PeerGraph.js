import React, { useEffect, useState, useRef } from 'react';
import * as am4core from '@amcharts/amcharts4/core';
import { ForceDirectedTree, ForceDirectedSeries } from '@amcharts/amcharts4/plugins/forceDirected';

const PeerGraph = ({ parent, children, currentUserId, currentUserDisplayName }) => {
  const [chartId] = useState(new Date().getTime())
  const chartRef = useRef();

  useEffect(
    () => {
      chartRef.current = am4core.create(`chartdiv-${chartId}`, ForceDirectedTree);
      const series = chartRef.current.series.push(new ForceDirectedSeries());

      series.dataFields.value = "value";
      series.dataFields.name = "name";
      series.dataFields.children = "children";
      series.dataFields.color = "color";

      series.nodes.template.label.text = "{name}";
      series.nodes.template.tooltipText = "{id}";

      series.fontSize = 10;
      series.minRadius = 10;
      series.maxRadius = 30;

      series.data = _formatChartData({ parent, children, currentUserId, currentUserDisplayName });

      return () => {
        chartRef.current.dispose();
      }
    },
    [parent, children, currentUserId]
  );

  return <div id={`chartdiv-${chartId}`} />;
}

export default PeerGraph

const _formatChartData = ({ parent, children, currentUserId, currentUserDisplayName }) => {
  const currentNode = { id: currentUserDisplayName, name: "current", value: 200, };

  currentNode.children = (children || []).map((child, idx) => ({
    id: child.displayName, name: `child #${idx + 1}`, value: 300, color: am4core.color("green"),
  }));

  if (parent) {
    const parentNode = { id: parent.displayName, name: "parent", value: 100, children: [currentNode] };
    return [parentNode];
  }

  return [currentNode];
}
