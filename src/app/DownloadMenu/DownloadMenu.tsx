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
import React, { useRef, useState } from "react";
import { Popover } from "../Popover";
import { DropdownMenu } from "../SelectDropdown/SelectDropdown";
import { ReactComponent as Icon } from "../assets/img/download_hover.svg";
import styled from "styled-components";
import { COLORS } from "../colors";

interface DownloadMenuProps {
  onDownloadHTML: (newTab: boolean) => void;
  onDownloadJSON: (newTab: boolean) => void;
  disabled?: boolean;
}

export const DownloadMenu: React.FC<DownloadMenuProps> = ({
  onDownloadHTML,
  onDownloadJSON,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLInputElement>();

  const andClose = (fun: (newTab: boolean) => void) => {
    return (event: React.MouseEvent) => {
      if (!disabled) {
        const meta = event.metaKey;
        fun(ref.current?.checked ? !meta : meta);
        setIsOpen(false);
      }
    };
  };

  return (
    <Wrapper>
      <DownloadIcon
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(true)}
        width="26px"
        height="26px"
      />
      <Popover
        open={isOpen}
        setOpen={setIsOpen}
        placement="bottom-start"
        width={200}
        maxHeight={500}
        yOffset={25}
      >
        <DropdownMenu
          options={[
            { label: "Download HTML", onSelect: andClose(onDownloadHTML) },
            { label: "Download JSON", onSelect: andClose(onDownloadJSON) },
          ]}
        />
        <NewTabContainer>
          <NewTabCheck type="checkbox" ref={ref} id="new-tab-check" />
          <NewTabLabel htmlFor="new-tab-check">Open in new tab</NewTabLabel>
        </NewTabContainer>
      </Popover>
    </Wrapper>
  );
};

const DownloadIcon = styled(Icon)<{
  disabled: boolean;
}>`
  cursor: pointer;

  .hoverfill {
    fill: transparent;
  }

  ${({ disabled }) => `
    .primaryfill {
      fill: ${disabled ? COLORS.other.fillMedium : COLORS.other.fillStrong};
    }

    &:hover {
      .hoverfill {
        fill: ${disabled ? "transparent" : COLORS.dimension.fillLight};
      }

      .primaryfill {
        fill: ${
          disabled ? COLORS.other.fillMedium : COLORS.dimension.fillStrong
        };
      }
    }
  `}
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  user-select: none;
`;

const NewTabContainer = styled.div`
  border-top: 1px solid #ececec;
  font-family: Roboto;
  padding: 10px 15px;
`;

const NewTabCheck = styled.input``;

const NewTabLabel = styled.label`
  margin-left: 8px;
  color: #5f6368;
`;
