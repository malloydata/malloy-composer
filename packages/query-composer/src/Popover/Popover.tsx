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
import React, { RefObject, useRef, useState } from "react";
import styled from "styled-components";
import { useClickOutside } from "../hooks";
import { usePopper } from "react-popper";
import { Placement } from "@popperjs/core";

interface PopoverProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  width?: number;
  maxHeight?: number;
  placement?: Placement;
  referenceDiv?: RefObject<HTMLDivElement>;
  zIndex?: number;
  xOffset?: number;
  yOffset?: number;
  disabled?: boolean;
}

export const PopoverBox = styled.div<{
  width: number;
  zIndex: number;
}>`
  border: 1px solid #ececed;
  border-radius: 4px;
  position: fixed;
  box-shadow: 0px 1px 5px 1px #0000001a;
  background-color: white;
  font-size: 14px;
  ${({ width, zIndex }) => `
    width: ${width}px;
    z-index: ${zIndex};
  `}
`;

const Wrapper = styled.div`
  position: relative;
`;

export const Popover: React.FC<PopoverProps> = ({
  open,
  setOpen,
  children,
  width = 350,
  placement = "right-start",
  referenceDiv,
  zIndex = 10,
  xOffset = 0,
  yOffset = 10,
  disabled = false,
}) => {
  const triggerRef = useRef<HTMLDivElement>(null);
  const [tooltipRef, setTooltipRef] = useState<HTMLElement | null>(null);

  const { styles, attributes } = usePopper(
    referenceDiv?.current || triggerRef.current,
    tooltipRef,
    {
      placement,
      modifiers: [
        {
          name: "offset",
          options: {
            offset: [xOffset, yOffset],
          },
        },
        {
          name: "preventOverflow",
          options: {
            altAxis: true,
            padding: 20,
            boundary: document.getElementsByTagName("body")[0],
          },
        },
        {
          name: "flip",
          options: {
            flipVariations: false,
          },
        },
      ],
    }
  );

  useClickOutside(triggerRef, () => setOpen(false));

  return (
    <Wrapper ref={triggerRef}>
      {open && !disabled && (
        <PopoverBox
          width={width}
          ref={setTooltipRef}
          style={{ ...styles.popper, position: "fixed" }}
          {...attributes.popper}
          zIndex={zIndex}
        >
          {children}
        </PopoverBox>
      )}
    </Wrapper>
  );
};
