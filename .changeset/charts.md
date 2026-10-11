---
'@creance-ui/react': minor
---

Charts. An atom, `Sparkline` (line, area or bars), and five molecules: `StatCard` (a number, a trend chip whose direction is also read out, and room for a sparkline), `LineChart` (a solid main series with a soft fill and dashed comparisons; point at it or use the arrow keys to read each point), `BarChart` (single with one bar picked out, or stacked), `DonutChart` (with each slice's value and share in the legend) and `BarList` (a ranking).

They are hand-built in SVG and HTML with no charting dependency. Series are ink and grey, differing in lightness and line style, with red for failure. Every chart carries its data as a visually hidden table. The set is meant for two or three series or five slices; beyond that, use a charting library.
