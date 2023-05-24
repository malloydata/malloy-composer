/*
 * Copyright 2023 Google LLC
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import { ReactComponent as VisIconTable } from "./assets/img/vis_icons/viz_table.svg";
import { ReactComponent as VisIconDashboard } from "./assets/img/vis_icons/viz_dashboard.svg";
import { ReactComponent as VisIconText } from "./assets/img/vis_icons/viz_text.svg";
import { ReactComponent as VisIconCurrency } from "./assets/img/vis_icons/viz_currency.svg";
import { ReactComponent as VisIconImage } from "./assets/img/vis_icons/viz_image.svg";
import { ReactComponent as VisIconTime } from "./assets/img/vis_icons/viz_time.svg";
import { ReactComponent as VisIconJSON } from "./assets/img/vis_icons/viz_json.svg";
import { ReactComponent as VisIconList } from "./assets/img/vis_icons/viz_list.svg";
import { ReactComponent as VisIconListDetail } from "./assets/img/vis_icons/viz_list_detail.svg";
import { ReactComponent as VisIconBarChart } from "./assets/img/vis_icons/viz_bar_chart.svg";
import { ReactComponent as VisIconScatterChart } from "./assets/img/vis_icons/viz_scatter.svg";
import { ReactComponent as VisIconLineChart } from "./assets/img/vis_icons/viz_line.svg";
import { ReactComponent as VisIconPointMap } from "./assets/img/vis_icons/viz_map_points.svg";
import { ReactComponent as VisIconSegmentMap } from "./assets/img/vis_icons/viz_map_segment.svg";
import { ReactComponent as VisIconShapeMap } from "./assets/img/vis_icons/viz_map_shape.svg";
import { ReactComponent as VisIconNumber } from "./assets/img/vis_icons/viz_number.svg";
import { ReactComponent as VisIconPercent } from "./assets/img/vis_icons/viz_percent.svg";
import { ReactComponent as VisIconBoolean } from "./assets/img/vis_icons/viz_boolean.svg";
import { ReactComponent as VisIconSparkLine } from "./assets/img/vis_icons/viz_sparkline.svg";
import { ReactComponent as VisIconLink } from "./assets/img/vis_icons/viz_link.svg";
import { RendererName } from "../types";

interface VisIconProps {
  renderer: RendererName;
}

export const VisIcon: React.FC<VisIconProps> = ({ renderer }) => {
  const props = { width: "22px", height: "22px" };
  return renderer === "table" ? (
    <VisIconTable {...props} />
  ) : renderer === "dashboard" ? (
    <VisIconDashboard {...props} />
  ) : renderer === "text" ? (
    <VisIconText {...props} />
  ) : renderer === "currency" ? (
    <VisIconCurrency {...props} />
  ) : renderer === "image" ? (
    <VisIconImage {...props} />
  ) : renderer === "time" ? (
    <VisIconTime {...props} />
  ) : renderer === "json" ? (
    <VisIconJSON {...props} />
  ) : renderer === "list" ? (
    <VisIconList {...props} />
  ) : renderer === "list_detail" ? (
    <VisIconListDetail {...props} />
  ) : renderer === "bar_chart" ? (
    <VisIconBarChart {...props} />
  ) : renderer === "scatter_chart" ? (
    <VisIconScatterChart {...props} />
  ) : renderer === "line_chart" ? (
    <VisIconLineChart {...props} />
  ) : renderer === "point_map" ? (
    <VisIconPointMap {...props} />
  ) : renderer === "segment_map" ? (
    <VisIconSegmentMap {...props} />
  ) : renderer === "shape_map" ? (
    <VisIconShapeMap {...props} />
  ) : renderer === "number" ? (
    <VisIconNumber {...props} />
  ) : renderer === "percent" ? (
    <VisIconPercent {...props} />
  ) : renderer === "boolean" ? (
    <VisIconBoolean {...props} />
  ) : renderer === "sparkline" ? (
    <VisIconSparkLine {...props} />
  ) : renderer === "link" ? (
    <VisIconLink {...props} />
  ) : null;
};
