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
import * as React from 'react';
import styled from 'styled-components';
import {RendererName} from '../../types';
import {
  ContextMenuContent,
  ContextMenuOuter,
  ScrollMain,
} from '../CommonElements';
import {FieldButton} from '../FieldButton';
import {VisIcon} from '../VisIcon';

interface DataStyleContextBarProps {
  setRenderer: (rendererName: RendererName) => void;
  onComplete: () => void;
  allowedRenderers: RendererName[];
}

export const DataStyleContextBar: React.FC<DataStyleContextBarProps> = ({
  setRenderer,
  onComplete,
  allowedRenderers,
}) => (
  <ContextMenuOuter>
    <ScrollMain>
      <ContextMenuContent>
        <ListDiv>
          {allowedRenderers.map(renderer => {
            return (
              <FieldButton
                icon={<VisIcon renderer={renderer} />}
                key={renderer}
                onClick={() => {
                  setRenderer(renderer);
                  onComplete();
                }}
                name={renderer}
                color="other"
              />
            );
          })}
        </ListDiv>
      </ContextMenuContent>
    </ScrollMain>
  </ContextMenuOuter>
);

const ListDiv = styled.div`
  overflow: hidden;
  display: flex;
  gap: 2px;
  flex-direction: column;
`;
