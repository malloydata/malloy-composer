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
import React, {ReactNode, RefObject} from 'react';
import styled from 'styled-components';
import {useClickOutside} from '../../hooks';
import {flip, offset, Placement, useFloating} from '@floating-ui/react-dom';

interface PopoverProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  width?: number | string;
  maxHeight?: number;
  placement?: Placement;
  referenceDiv?: RefObject<HTMLDivElement>;
  zIndex?: number;
  xOffset?: number;
  yOffset?: number;
  disabled?: boolean;
  children: ReactNode;
}

export const PopoverBox = styled.div<{
  width: number | string;
  zIndex: number;
}>`
  border: 1px solid var(--malloy-composer-menu-border, #ececed);
  border-radius: 4px;
  position: fixed;
  box-shadow: 0px 1px 5px 1px #0000001a;
  background-color: var(--malloy-composer-menu-background, white);
  font-size: var(--malloy-composer-menu-fontSize, 14px);
  ${({width, zIndex}) => `
    width: ${typeof width === 'string' ? width : `${width}px`};
    z-index: ${zIndex};
  `}
`;

const Wrapper = styled.div`
  position: relative;
`;

export const Popover: React.FC<PopoverProps> = ({
  open,
  children,
  width = 350,
  placement = 'right-start',
  referenceDiv,
  setOpen,
  zIndex = 10,
  xOffset = 0,
  yOffset = 10,
  disabled = false,
}) => {
  const {refs, floatingStyles} = useFloating({
    placement,
    strategy: 'fixed',
    open,
    middleware: [
      offset({mainAxis: xOffset, crossAxis: yOffset}),
      flip({boundary: document.body}),
    ],
    elements: {
      reference: referenceDiv?.current,
    },
  });

  useClickOutside(refs.floating, () => setOpen(false));

  return (
    <Wrapper ref={refs.setReference}>
      {open && !disabled && (
        <PopoverBox
          width={width}
          ref={refs.setFloating}
          style={floatingStyles}
          zIndex={zIndex}
        >
          {children}
        </PopoverBox>
      )}
    </Wrapper>
  );
};
