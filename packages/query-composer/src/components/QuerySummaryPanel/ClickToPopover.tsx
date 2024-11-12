/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import {ReactElement, useEffect, useRef, useState} from 'react';
import styled from 'styled-components';
import {Popover} from '../Popover';

export interface ClickToPopoverProps {
  popoverContent: (props: {
    setOpen: (open: boolean) => void;
    closeMenu: () => void;
  }) => ReactElement | null;
  content: (props: {isOpen: boolean; closeMenu: () => void}) => ReactElement;
}

export const ClickToPopover: React.FC<ClickToPopoverProps> = ({
  popoverContent,
  content,
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
    <>
      <ClickToPopoverDiv onClick={() => !closing.current && setOpen(true)}>
        <div ref={ref} key={open ? 'open' : 'closed'}>
          {content({isOpen: open, closeMenu})}
        </div>
        <Popover open={open} setOpen={setOpen} referenceDiv={ref}>
          {popoverContent({setOpen, closeMenu})}
        </Popover>
      </ClickToPopoverDiv>
    </>
  );
};

const ClickToPopoverDiv = styled.div`
  position: relative;
`;
