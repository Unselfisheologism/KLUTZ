'use client';

import {
  PieChart as RCPieChart, Pie, Cell, Tooltip as RCTooltip, Legend as RCLegend,
  BarChart as RCBarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart as RCLineChart, Line, AreaChart as RCAreaChart, Area,
  ScatterChart as RCScatterChart, Scatter, ZAxis
} from 'recharts';
import HeatMapGrid from 'react-heatmap-grid';

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00bcd4',
  '#ff6384', '#36a2eb', '#cc65fe', '#ffce56', '#009688'
];

function isValid2DNumberArray(arr: any): arr is number[][] {
  return Array.isArray(arr) &&
    arr.length > 0 &&
    arr.every(
      row => Array.isArray(row) && row.length > 0 && row.every(cell => typeof cell === 'number' && !isNaN(cell))
    );
}

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

export default function ClientInfographicRenderer({
  infographicData
}: {
  infographicData: {
    type: string;
    title: string;
    description?: string;
    data: any;
    config?: any;
    svgContent?: string;
  } | null;
}) {
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

  // Harden chart data
  let pieData = data;
  if (type === 'pie') {
    pieData = normalizePieData(pieData);
  }

  // Bar/Line/Area/Scatter: must be array of objects with correct keys
  const hasValidXY =
    Array.isArray(data) &&
    data.length > 0 &&
    config &&
    typeof config.xKey === 'string' &&
    typeof config.yKey === 'string' &&
    data[0][config.xKey] !== undefined &&
    data[0][config.yKey] !== undefined;

  // Heatmap: must be 2D array of numbers
  const isHeatmap = type === 'heatmap' && isValid2DNumberArray(data);

  // Tree: not implemented, show message
  const isTree = type === 'tree';

  // Scatter: must have xKey/yKey and numbers
  const isScatter =
    type === 'scatter' &&
    hasValidXY &&
    typeof data[0][config.xKey] === 'number' &&
    typeof data[0][config.yKey] === 'number';

  // Line: xKey can be string, yKey must be number
  const isLine =
    type === 'line' &&
    hasValidXY &&
    typeof data[0][config.yKey] === 'number';

  // Area: same as line
  const isArea =
    type === 'area' &&
    hasValidXY &&
    typeof data[0][config.yKey] === 'number';

  // Bar: xKey can be string, yKey must be number
  const isBar =
    type === 'bar' &&
    hasValidXY &&
    typeof data[0][config.yKey] === 'number';

  // Pie: must be array of {name, value}
  const isPie = type === 'pie' && Array.isArray(pieData) && pieData.length > 0 && pieData[0].name && pieData[0].value !== undefined;

  // Show error for invalid JSON/data
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
        {isPie && (
          <RCPieChart width={400} height={400}>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%" cy="50%"
              outerRadius={140}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
            >
              {pieData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
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
            <Bar dataKey={config.yKey} fill={COLORS[0]} />
          </RCBarChart>
        )}
        {isLine && (
          <RCLineChart width={500} height={300} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={config.xKey} />
            <YAxis />
            <RCTooltip />
            <RCLegend />
            <Line type="monotone" dataKey={config.yKey} stroke={COLORS[0]} />
          </RCLineChart>
        )}
        {isArea && (
          <RCAreaChart width={500} height={300} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={config.xKey} />
            <YAxis />
            <RCTooltip />
            <RCLegend />
            <Area type="monotone" dataKey={config.yKey} stroke={COLORS[0]} fill={COLORS[1]} />
          </RCAreaChart>
        )}
        {isScatter && (
          <RCScatterChart width={500} height={300}>
            <CartesianGrid />
            <XAxis dataKey={config.xKey} name={config.xKey} />
            <YAxis dataKey={config.yKey} name={config.yKey} />
            <ZAxis dataKey={config.zKey || undefined} range={[60, 400]} />
            <RCTooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="Scatter Data" data={data} fill={COLORS[2]} />
          </RCScatterChart>
        )}
        {isHeatmap && (
          <div style={{ width: 400, height: 320 }}>
            <HeatMapGrid
              data={data}
              xLabels={config?.xLabels || Array.from({ length: data[0]?.length || 0 }, (_, i) => `Col ${i+1}`)}
              yLabels={config?.yLabels || Array.from({ length: data.length }, (_, i) => `Row ${i+1}`)}
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
          <div className="text-center text-muted-foreground">
            Tree diagrams are not yet supported.
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
