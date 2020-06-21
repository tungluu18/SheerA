import React, { useEffect, useState, useRef } from 'react';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import { ForceDirectedTree, ForceDirectedSeries } from '@amcharts/amcharts4/plugins/forceDirected';

import Paper from '@material-ui/core/Paper';

const PeerGraph = ({ parent, children, currentUserId }) => {
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
      console.debug(series.nodes.template);
      series.fontSize = 10;
      series.minRadius = 10;
      series.maxRadius = 30;

      series.data = _formatChartData({ parent, children, currentUserId });

      return () => {
        chartRef.current.dispose();
      }
    },
    [parent, children, currentUserId]
  );

  return (
    // <Paper>
    <div id={`chartdiv-${chartId}`} />
    // </Paper>
  );
}

export default PeerGraph

const _formatChartData = ({ parent, children, currentUserId }) => {
  const currentNode = { id: currentUserId, name: "current", value: 200, };

  currentNode.children = (children || []).map((child, idx) => ({
    id: child, name: `child #${idx + 1}`, value: 300, color: am4core.color("green"),
  }));

  if (parent) {
    const parentNode = { id: parent, name: "parent", value: 100, children: [currentNode] };
    return [parentNode];
  }

  return [currentNode];
}
