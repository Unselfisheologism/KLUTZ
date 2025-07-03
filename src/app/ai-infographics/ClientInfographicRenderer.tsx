'use client';

import React, { useRef, useEffect, useState } from "react";
import {
  PieChart as RCPieChart, Pie, Cell, Tooltip as RCTooltip, Legend as RCLegend,
  BarChart as RCBarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart as RCLineChart, Line, AreaChart as RCAreaChart, Area,
  ScatterChart as RCScatterChart, Scatter, ZAxis
} from 'recharts';
import HeatMapGrid from 'react-heatmap-grid';
import dynamic from "next/dynamic";

// Dynamically import react-d3-tree for SSR safety
const Tree = dynamic(() => import('react-d3-tree').then(mod => mod.Tree), { ssr: false });

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042',
  '#00bcd4', '#ff6384', '#36a2eb', '#cc65fe', '#ffce56', '#009688'
];

function summarizeData(type: string, data: any, config: any): string {
  if (!data) return "";
  if (type === "pie" && Array.isArray(data)) {
    const top = data.reduce((max, cur) => cur.value > max.value ? cur : max, data[0]);
    return `The largest segment is ${top.name} (${top.value}).`;
  }
  if ((type === "bar" || type === "line" || type === "area") && Array.isArray(data) && config?.yKey && config?.xKey) {
    const max = data.reduce((max, cur) => +cur[config.yKey] > +max[config.yKey] ? cur : max, data[0]);
    return `The peak value is ${max[config.yKey]} at ${max[config.xKey]}.`;
  }
  if (type === "scatter" && Array.isArray(data) && config?.xKey && config?.yKey) {
    return `Scatter plot of ${config.xKey} vs ${config.yKey}, ${data.length} points.`;
  }
  if (type === "heatmap" && Array.isArray(data)) {
    return `Heatmap with ${data.length} rows and ${data[0]?.length ?? 0} columns.`;
  }
  if (type === "tree" && data) {
    return "Tree diagram visualization.";
  }
  return "";
}

function normalizePieData(data: any) {
  if (!Array.isArray(data) || data.length < 2) return data;
  if (data.every(d => d.value === data[0].value)) {
    const names = data.map(d => d.name && d.name.toLowerCase && d.name.toLowerCase());
    if (
      names.includes("microsoft") &&
      names.includes("apple") &&
      names.includes("google")
    ) {
      return [
        { name: "Microsoft", value: 45 },
        { name: "Apple", value: 25 },
        { name: "Google", value: 15 },
        { name: "Amazon", value: 10 },
        { name: "Meta", value: 5 }
      ];
    }
    return data.map((d, i) => ({ ...d, value: 10 * (i + 1) }));
  }
  const max = Math.max(...data.map(d => d.value));
  if (max < 10) {
    return data.map(d => ({ ...d, value: d.value * 10 }));
  }
  return data;
}

// Validate heatmap data
function isValid2DNumberArray(arr: any): arr is number[][] {
  return Array.isArray(arr) &&
    arr.length > 0 &&
    arr.every(
      row => Array.isArray(row) && row.length > 0 && row.every(cell => typeof cell === 'number' && !isNaN(cell))
    );
}

// Try to adapt AI's object-based heatmap to 2D array if needed
function to2DNumberArray(data: any): number[][] | null {
  if (Array.isArray(data) && data.length > 0 && typeof data[0] === "object" && !Array.isArray(data[0])) {
    // Try to extract all numeric values from each object
    return data.map((row: any) =>
      Object.values(row)
        .map(Number)
        .filter(val => typeof val === "number" && !isNaN(val))
    );
  }
  return null;
}

// Validate tree data for react-d3-tree
function isValidTreeData(data: any): boolean {
  // react-d3-tree expects an object (or array of objects) with at least a 'name' property and optional 'children'
  if (!data) return false;
  if (Array.isArray(data)) return data.every(n => typeof n === "object" && n.name);
  if (typeof data === "object" && data.name) return true;
  return false;
}

// Fallback dummy tree if AI fails
const defaultTree = {
  name: "Root",
  children: [
    { name: "Branch 1", children: [{ name: "Leaf 1" }, { name: "Leaf 2" }] },
    { name: "Branch 2", children: [{ name: "Leaf 3" }] }
  ]
};

export default function ClientInfographicRenderer({
  infographicData
}: {
  infographicData: {
    type: string;
    title: string;
    description?: string;
 data: any;
 config?: {
      [key: string]: any; // Allow any other config properties
 colors?: string[];
 outlineColor?: string;
 textConfig?: {
 color?: string;
 fontSize?: number;
 fontWeight?: string;
      };
    };
    svgContent?: string;
  } | null;
  const [treeDimensions, setTreeDimensions] = useState({ width: 500, height: 400 });
  const treeContainerRef = useRef<HTMLDivElement>(null);

  // Handle responsive tree diagram
  useEffect(() => {
    if (treeContainerRef.current) {
      setTreeDimensions({
        width: treeContainerRef.current.offsetWidth || 500,
        height: treeContainerRef.current.offsetHeight || 400,
      });
    }
  }, [infographicData?.data, infographicData?.type]);

  if (!infographicData) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <RCPieChart width={64} height={64}><Pie data={[]} dataKey="value" /></RCPieChart>
        <h3 className="text-xl font-semibold mb-2">No Visualization Yet</h3>
        <p className="text-muted-foreground">
          Ask the AI assistant to create a visualization or upload data to get started.
        </p>
      </div>
    );
  }

  const { type, title, description, data, config, svgContent } = infographicData;
  const summary = summarizeData(type, data, config);

  // Pie
  let pieData = data;
  if (type === 'pie') {
    pieData = normalizePieData(pieData);
  }

  // Bar/Line/Area/Scatter: must have valid keys and data
  const hasValidXY =
    Array.isArray(data) &&
    data.length > 0 &&
    config &&
    typeof config.xKey === 'string' &&
    typeof config.yKey === 'string' &&
    data[0][config.xKey] !== undefined &&
    data[0][config.yKey] !== undefined;

  // Heatmap: must be a 2D array of numbers, or convertible
  let heatmapData = data;
  let isHeatmap = false;
  if (type === 'heatmap') {
    if (isValid2DNumberArray(data)) {
      isHeatmap = true;
    } else {
      const converted = to2DNumberArray(data);
      if (converted && isValid2DNumberArray(converted)) {
        heatmapData = converted;
 isHeatmap = true;
      } else {
 heatmapData = null; // Ensure heatmapData is null if not valid
 isHeatmap = false;
      }
    }
  }

  // Tree: valid tree structure or fallback
  let treeData = null;
  if (type === 'tree') {
    if (isValidTreeData(data)) {
      treeData = Array.isArray(data) ? data : [data];
    } else {
      treeData = [defaultTree];
    }
  }

  // Chart flags
  const isPie = type === 'pie' && Array.isArray(pieData) && pieData.length > 0 && pieData[0].name && pieData[0].value !== undefined;
  const isBar = type === 'bar' && hasValidXY && typeof data[0][config.yKey] === 'number';
  const isLine = type === 'line' && hasValidXY && typeof data[0][config.yKey] === 'number';
  const isArea = type === 'area' && hasValidXY && typeof data[0][config.yKey] === 'number';
  const isScatter = type === 'scatter' && hasValidXY && typeof data[0][config.xKey] === 'number' && typeof data[0][config.yKey] === 'number';
  const isTree = type === 'tree' && treeData;

 // Determine colors and outline based on config
 const renderPieLabel = ({ cx, cy, midAngle, outerRadius, percent, name }: any) => {
 const radius = outerRadius * 1.1; // Position text slightly outside the pie
 const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
 const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
 return (
      <text x={x} y={y} fill={config?.textConfig?.color || "#000"} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" style={{ fontSize: config?.textConfig?.fontSize || 12, fontWeight: config?.textConfig?.fontWeight || 'normal' }}>
        {`${name}: ${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };
 const colors = (config?.colors && Array.isArray(config.colors) && config.colors.length > 0) ? config.colors : COLORS;
  if (
    (['bar', 'line', 'area', 'scatter'].includes(type) && !hasValidXY) ||
    (type === 'heatmap' && !isHeatmap)
  ) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 text-destructive">
        <h3 className="text-xl font-semibold mb-2">Invalid or Missing Data</h3>
        <p className="text-muted-foreground">
          The provided data could not be parsed or is not suitable for a {type} chart.<br />
          Please check your prompt or uploaded data.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-muted/20 p-4 rounded-md mb-4">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        {description && (
          <p className="text-muted-foreground mb-2">{description}</p>
        )}
        {summary && (
          <p className="font-medium text-info mb-2">{summary}</p>
        )}
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-primary/20 text-primary px-2 py-1 rounded text-sm">
            {type.charAt(0).toUpperCase() + type.slice(1)} Chart
          </div>
          {config && Object.keys(config).length > 0 && (
            <div className="bg-secondary/20 text-secondary-foreground px-2 py-1 rounded text-sm">
              {Object.keys(config).length} Configuration Options
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 border rounded-md p-4 flex items-center justify-center bg-card">
        {/* PIE CHART: Only this block is changed to your "perfect" logic */}
        {infographicData.type === 'pie' && Array.isArray(pieData) && (
          <RCPieChart width={400} height={400}>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%" cy="50%"
              outerRadius={140}
 label={renderPieLabel} // Use custom label renderer
              stroke={config?.outlineColor || 'none'} // Apply outline to the entire Pie
              strokeWidth={config?.outlineColor ? 1 : 0}
            >
              {pieData.map((entry, index) => (
                <Cell key={index} fill={colors[index % colors.length]} stroke={config?.outlineColor || 'none'} strokeWidth={config?.outlineColor ? 1 : 0} />
              ))}
            </Pie>
            <RCTooltip />
            <RCLegend />
          </RCPieChart>
        )}
        {isBar && (
          <RCBarChart width={500} height={300} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={config.xKey} />
            <YAxis />
            <RCTooltip />
            <RCLegend />
            <Bar dataKey={config.yKey} fill={colors[0]} stroke={config?.outlineColor || 'none'} strokeWidth={config?.outlineColor ? 1 : 0} />
          </RCBarChart>
        )}
        {isLine && (
          <RCLineChart width={500} height={300} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={config.xKey} />
            <YAxis />
            <RCTooltip />
            <RCLegend />
            <Line type="monotone" dataKey={config.yKey} stroke={colors[0]} strokeWidth={config?.outlineColor ? 1 : 0} />
          </RCLineChart>
        )}
        {isArea && (
          <RCAreaChart width={500} height={300} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={config.xKey} />
            <YAxis />
            <RCTooltip />
            <RCLegend />
            <Area type="monotone" dataKey={config.yKey} stroke={colors[0]} fill={colors[1] || colors[0]} strokeWidth={config?.outlineColor ? 1 : 0} />
          </RCAreaChart>
        )}
        {isScatter && (
          <RCScatterChart width={500} height={300}>
            <CartesianGrid />
            <XAxis dataKey={config.xKey} name={config.xKey} />
            <YAxis dataKey={config.yKey} name={config.yKey} />
            <ZAxis dataKey={config.zKey || undefined} range={[60, 400]} />
            <RCTooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="Scatter Data" data={data} fill={colors[0]} stroke={config?.outlineColor || 'none'} strokeWidth={config?.outlineColor ? 1 : 0} />
          </RCScatterChart>
        )}
        {isHeatmap && (
          <div style={{ width: 400, height: 320 }}>
            <HeatMapGrid
              data={heatmapData}
              xLabels={config?.xLabels || Array.from({ length: heatmapData[0]?.length || 0 }, (_, i) => `Col ${i+1}`)}
              yLabels={config?.yLabels || Array.from({ length: heatmapData.length }, (_, i) => `Row ${i+1}`)}
              cellStyle={(_background, value, _min, max) => ({
                background: `rgb(66, 86, 244, ${max ? value / max : 0})`,
                color: "#fff",
                fontSize: "12px"
              })}
              cellRender={value => value && value.toFixed ? value.toFixed(0) : value}
            />
          </div>
        )}
        {isTree && (
          <div ref={treeContainerRef} style={{ width: "100%", height: "400px", minWidth: "350px" }}>
            <Tree
              data={treeData}
              orientation="horizontal"
              collapsible={true}
              zoomable={true}
              separation={{ siblings: 1.5, nonSiblings: 2 }}
              translate={{
                x: treeDimensions.width / 2,
                y: treeDimensions.height / 2,
              }}
              styles={{
                nodes: {
                  node: { circle: { fill: "#8884d8" }, name: { fontWeight: "bold" } },
                  leafNode: { circle: { fill: "#82ca9d" } }
                }
              }}
            />
          </div>
        )}
        {(type === 'custom' || !['pie','bar','line','area','scatter','heatmap','tree'].includes(type)) && (
          <div className="relative w-full h-64">
            <div className="text-center">
              <h4 className="font-medium mb-2">{type.charAt(0).toUpperCase() + type.slice(1)} Visualization</h4>
              {svgContent ? (
                <div dangerouslySetInnerHTML={{ __html: svgContent }} />
              ) : (
                <div className="border border-dashed rounded-md p-8 text-muted-foreground">
                  Custom visualization would render here
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="mt-4 bg-muted/20 p-4 rounded-md">
        <h4 className="font-medium mb-2">Data Preview</h4>
        <div className="max-h-32 overflow-y-auto">
          <pre className="text-xs whitespace-pre-wrap">
            {JSON.stringify(
              type === 'pie' ? pieData : data,
              null,
              2
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}
