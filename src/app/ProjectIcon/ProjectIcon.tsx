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

import { ReactComponent as ProjectIconAirplane } from "../assets/img/project_icons/airplane.svg";
import { ReactComponent as ProjectIconBallotBox } from "../assets/img/project_icons/ballot-box.svg";
import { ReactComponent as ProjectIconIdentity } from "../assets/img/project_icons/identity.svg";
import { ReactComponent as ProjectIconLiquor } from "../assets/img/project_icons/liquor.svg";
import { ReactComponent as ProjectIconMuseum } from "../assets/img/project_icons/museum.svg";
import { ReactComponent as ProjectIconNewspaper } from "../assets/img/project_icons/newspaper.svg";
import { ReactComponent as ProjectIconShopping } from "../assets/img/project_icons/shopping.svg";
import { ReactComponent as ProjectIconWebBrowser } from "../assets/img/project_icons/web-browser.svg";

export const ProjectIcon: React.FC<{ name: string }> = ({ name }) => {
  const sizeProps = { width: "40px", height: "40px" };
  switch (name) {
    case "airplane":
      return <ProjectIconAirplane {...sizeProps} />;
    case "ballot-box":
      return <ProjectIconBallotBox {...sizeProps} />;
    case "identity":
      return <ProjectIconIdentity {...sizeProps} />;
    case "liquor":
      return <ProjectIconLiquor {...sizeProps} />;
    case "museum":
      return <ProjectIconMuseum {...sizeProps} />;
    case "newspaper":
      return <ProjectIconNewspaper {...sizeProps} />;
    case "shopping":
      return <ProjectIconShopping {...sizeProps} />;
    case "web-browser":
      return <ProjectIconWebBrowser {...sizeProps} />;
    default:
      return <ProjectIconNewspaper {...sizeProps} />;
  }
};
