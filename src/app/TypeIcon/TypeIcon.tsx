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
import { ReactComponent as TypeIconBoolean } from "../assets/img/type_icons/type-icon-on-off.svg";
import { ReactComponent as TypeIconDate } from "../assets/img/type_icons/type-icon-date.svg";
import { ReactComponent as TypeIconNumber } from "../assets/img/type_icons/type-icon-number.svg";
import { ReactComponent as TypeIconString } from "../assets/img/type_icons/type-icon-string.svg";
import { ReactComponent as TypeIconJSON } from "../assets/img/type_icons/type-icon-json.svg";
import { ReactComponent as TypeIconQuery } from "../assets/img/type_icons/type-icon-query.svg";
import { ReactComponent as TypeIconSource } from "../assets/img/type_icons/type-icon-projection.svg";
import { ReactComponent as TypeIconMeasure } from "../assets/img/type_icons/type-icon-number-measure.svg";
import { FieldKind, FieldType } from "../../app/utils";

interface TypeIconProps {
  type: FieldType;
  kind: FieldKind;
}

export const TypeIcon: React.FC<TypeIconProps> = ({ type, kind }) => {
  const sizeProps = { width: "22px", height: "22px" };
  if (kind === "measure") {
    return <TypeIconMeasure {...sizeProps} />;
  } else if (type === "string") {
    return <TypeIconString {...sizeProps} />;
  } else if (type === "boolean") {
    return <TypeIconBoolean {...sizeProps} />;
  } else if (type === "json") {
    return <TypeIconJSON {...sizeProps} />;
  } else if (type === "number") {
    return <TypeIconNumber {...sizeProps} />;
  } else if (type === "date") {
    return <TypeIconDate {...sizeProps} />;
  } else if (type === "timestamp") {
    return <TypeIconDate {...sizeProps} />;
  } else if (type === "query") {
    return <TypeIconQuery {...sizeProps} />;
  } else if (type === "source") {
    return <TypeIconSource {...sizeProps} />;
  }
  throw new Error("Invalid icon type");
};
