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

import { ReactComponent as ChannelIconAbout } from "../assets/img/channel_icons/channel_about.svg";
import { ReactComponent as ChannelIconFeedback } from "../assets/img/channel_icons/channel_feedback.svg";
import { ReactComponent as ChannelIconHelp } from "../assets/img/channel_icons/channel_help.svg";
import { ReactComponent as ChannelIconPreview } from "../assets/img/channel_icons/channel_preview.svg";
import { ReactComponent as ChannelIconQuery } from "../assets/img/channel_icons/channel_query.svg";
import { ReactComponent as ChannelIconSamples } from "../assets/img/channel_icons/channel_samples.svg";
import { ReactComponent as ChannelIconSettings } from "../assets/img/channel_icons/channel_settings.svg";
import { ReactComponent as ChannelIconSource } from "../assets/img/channel_icons/channel_source.svg";
import { ReactComponent as ChannelIconHome } from "../assets/img/channel_icons/channel_home.svg";

export type ChannelIconName =
  | "about"
  | "feedback"
  | "help"
  | "preview"
  | "query"
  | "samples"
  | "settings"
  | "source"
  | "home";

export const ChannelIcon: React.FC<{ name: ChannelIconName }> = ({ name }) => {
  const sizeProps = { width: "18px", height: "18px" };
  switch (name) {
    case "about":
      return <ChannelIconAbout {...sizeProps} />;
    case "feedback":
      return <ChannelIconFeedback {...sizeProps} />;
    case "help":
      return <ChannelIconHelp {...sizeProps} />;
    case "preview":
      return <ChannelIconPreview {...sizeProps} />;
    case "query":
      return <ChannelIconQuery {...sizeProps} />;
    case "samples":
      return <ChannelIconSamples {...sizeProps} />;
    case "settings":
      return <ChannelIconSettings {...sizeProps} />;
    case "source":
      return <ChannelIconSource {...sizeProps} />;
    case "home":
      return <ChannelIconHome {...sizeProps} />;
  }
};
