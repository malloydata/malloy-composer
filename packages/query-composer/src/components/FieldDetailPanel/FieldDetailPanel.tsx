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
import {useContext} from 'react';
import styled from 'styled-components';
import {ContextMenuMain, ScrollMain} from '../CommonElements';
import {largeNumberLabel} from '../../utils';
import {SearchContext} from '../../contexts/search_context';

export interface FieldDetailPanelProps {
  annotations?: string[];
  fieldPath?: string;
  filterExpression?: string;
  definition?: string;
}

export const FieldDetailPanel: React.FC<FieldDetailPanelProps> = ({
  annotations,
  fieldPath,
  filterExpression,
  definition,
}) => {
  const {topValues} = useContext(SearchContext);
  const fieldTopValues = topValues?.find(
    entry => entry.fieldName === fieldPath
  );
  return (
    <ScrollMain>
      <ContextMenuDetail>
        <InfoDiv>
          {fieldPath && (
            <InfoSection>
              <div>Path</div>
              <FieldPath>
                {fieldPath.length <= 32 ? (
                  fieldPath
                ) : (
                  <NestingFieldName path={fieldPath.split('.')} />
                )}
              </FieldPath>
            </InfoSection>
          )}
          {definition && (
            <InfoSection>
              <div>Definition</div>
              <FieldPath>{definition}</FieldPath>
            </InfoSection>
          )}
          {filterExpression && (
            <InfoSection>
              <div>Filter</div>
              <FieldPath>{filterExpression}</FieldPath>
            </InfoSection>
          )}
          {annotations?.length ? (
            <InfoSection>
              <div>Annotations</div>
              {annotations.map((annotation, idx) => (
                <FieldPath key={idx}>{annotation}</FieldPath>
              ))}
            </InfoSection>
          ) : null}
          {fieldTopValues && (
            <InfoSection>
              <div>Top Values</div>
              {fieldTopValues.values.slice(0, 8).map(value => (
                <TopValuesRow key={value.fieldValue}>
                  <TopValuesValue>
                    <TopValuesWeightInner>
                      {value.fieldValue === null ? (
                        <NullSymbol>∅</NullSymbol>
                      ) : (
                        value.fieldValue
                      )}
                    </TopValuesWeightInner>
                  </TopValuesValue>

                  <TopValuesWeight>
                    {largeNumberLabel(value.weight)}
                  </TopValuesWeight>
                </TopValuesRow>
              ))}
            </InfoSection>
          )}
        </InfoDiv>
      </ContextMenuDetail>
    </ScrollMain>
  );
};

const ContextMenuDetail = styled(ContextMenuMain)`
  border-radius: 4px;
  padding: 20px;
  font-family: var(--malloy-composer-font-family, sans-serif);
  background-color: var(--malloy-composer-menu-background, rgb(248, 248, 248));
  color: var(--malloy-composer-menu-foreground, #505050);
`;

const NullSymbol = styled.span``;

const FieldPath = styled.div`
  color: var(--malloy-composer-foreground, #505050);
  font-weight: normal;
  font-family: var(--malloy-composer-code-fontFamily, monospace);
  font-weight: normal;
  font-size: var(--malloy-composer-fontSize, 14px);
  text-transform: none;
  overflow-wrap: break-word;
  padding: 4px 0px;
`;

const InfoDiv = styled.div`
  display: flex;
  gap: 15px;
  flex-direction: column;
`;

const InfoSection = styled.div`
  display: flex;
  gap: 2px;
  flex-direction: column;
`;

const NestingFieldName: React.FC<{path: string[]; top?: boolean}> = ({
  path,
  top = true,
}) => {
  return (
    <div>
      {top ? '' : '.'}
      {path[0]}
      {path.length > 1 && (
        <FieldNameNest>
          <NestingFieldName path={path.slice(1)} top={false} />
        </FieldNameNest>
      )}
    </div>
  );
};

const FieldNameNest = styled.div`
  margin-left: 10px;
`;

export const TopValuesValue = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-start;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--malloy-composer-foreground, #505050);
`;

export const TopValuesWeight = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  align-items: center;
  overflow: hidden;
  flex-shrink: 0;
  color: #9aa0a6;
`;

export const TopValuesWeightInner = styled.div`
  text-overflow: ellipsis;
  text-transform: none;
  color: var(--malloy-composer-foreground, #505050);
  overflow: hidden;
  white-space: nowrap;
`;

export const TopValuesRow = styled.div`
  border: none;
  background-color: transparent;
  border-radius: 50px;
  padding: 4px 0px;
  text-align: left;
  display: flex;
  color: var(--malloy-composer-foreground, #353535);
  user-select: none;
  font-size: var(--malloy-composer-code-fontSize, 14px);
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  font-family: var(--malloy-composer-code-fontFamily, monospace);
  font-weight: normal;
`;
