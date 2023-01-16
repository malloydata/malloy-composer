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
import { ReactElement, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Popover } from "../Popover";

interface HoverToPopoverProps {
  popoverContent: (props: {
    setOpen: (open: boolean) => void;
    closeMenu: () => void;
  }) => ReactElement | null;
  content: (props: { isOpen: boolean; closeMenu: () => void }) => ReactElement;
  width: number;
  enabled?: boolean;
  zIndex?: number;
}

export const HoverToPopover: React.FC<HoverToPopoverProps> = ({
  popoverContent,
  content,
  width,
  enabled = true,
  zIndex = 11,
}) => {
  const [open, setOpen] = useState(false);
  const closing = useRef(false);
  const ref = useRef<HTMLDivElement>(null);

  const closeMenu = () => {
    closing.current = true;
    setOpen(false);
  };

  useEffect(() => {
    closing.current = false;
  }, [open]);

  return (
    <HoverToPopoverDiv
      onMouseEnter={() => !closing.current && setOpen(true)}
      onMouseLeave={closeMenu}
    >
      <div ref={ref}>{content({ isOpen: open, closeMenu })}</div>
      {(() => {
        const content = popoverContent({ setOpen, closeMenu });
        return (
          <Popover
            open={enabled && open && content !== null}
            setOpen={setOpen}
            referenceDiv={ref}
            zIndex={zIndex}
            width={width}
          >
            {content}
          </Popover>
        );
      })()}
    </HoverToPopoverDiv>
  );
};

const HoverToPopoverDiv = styled.div`
  position: relative;
`;
