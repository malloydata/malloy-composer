/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import {useState} from 'react';
import styled from 'styled-components';
import {QuerySummary, QuerySummaryParameter} from '../../types';
import {QueryModifiers} from '../../hooks';
import {titleize} from '../../core/utils';
import {DateInput} from '../DateInput';
import {timeToString, toDate} from '../../core/filters';
import {stringFromExpr} from '../../core/expr';
import {ClickToPopover} from '../QuerySummaryPanel/ClickToPopover';
import {ActionIcon} from '../ActionIcon';
import {
  Button,
  ButtonAndInputRow,
  ContextMenuMain,
  ContextMenuTitle,
} from '../CommonElements';
// import {DatePicker} from '../DatePicker';

interface ParameterViewerProps {
  parameter: QuerySummaryParameter;
}

interface ParameterEditorProps {
  parameter: QuerySummaryParameter;
  queryModifiers: QueryModifiers;
  closeMenu: () => void;
}

const ParameterViewer = ({
  parameter: {name, value, defaultValue},
}: ParameterViewerProps) => {
  const stringValue = stringFromExpr(value ?? defaultValue ?? null, '∅');
  return (
    <ParameterBox>
      <Label>{titleize(name)}:</Label>
      <Value>{stringValue}</Value>
      <Hover>
        <ActionIcon action="edit" />
      </Hover>
    </ParameterBox>
  );
};

const ParameterEditor = ({
  parameter: {name, type, value, defaultValue},
  queryModifiers,
  closeMenu,
}: ParameterEditorProps) => {
  const [current, setCurrent] = useState<string>(
    stringFromExpr(value ?? defaultValue ?? null, '')
  );

  const update = () => queryModifiers.editParameter(name, current);
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      update();
      closeMenu();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      closeMenu();
    }
  };

  const getParameterEditor = () => {
    if (type === 'date') {
      return (
        <DateInput
          value={toDate(current)}
          setValue={time => {
            setCurrent(timeToString(time, 'day'));
          }}
          granularity="day"
        />
      );
    } else if (type === 'time') {
      return (
        <DateInput
          value={toDate(current)}
          setValue={time => {
            setCurrent(timeToString(time, 'second'));
          }}
          granularity="second"
        />
      );
    } else if (type === 'number') {
      return (
        <StyledInput
          type="number"
          value={current}
          placeholder={stringFromExpr(defaultValue ?? null, '')}
          onChange={e => setCurrent(e.target.value)}
        />
      );
    } else if (type === 'boolean') {
      return (
        <StyledInput
          type="checkbox"
          checked={current === 'true'}
          onChange={e => {
            const value = e.target.checked ? 'true' : 'false';
            setCurrent(value);
          }}
        />
      );
    } else {
      return (
        <StyledInput
          value={current}
          placeholder={stringFromExpr(defaultValue ?? null, '')}
          onChange={e => setCurrent(e.target.value)}
        />
      );
    }
  };
  return (
    <ContextMenuMain onKeyDown={onKeyDown}>
      <ContextMenuTitle>{titleize(name)}</ContextMenuTitle>
      <ButtonAndInputRow>
        {getParameterEditor()}
        <Button onClick={closeMenu}>Cancel</Button>
        <Button
          onClick={() => {
            update();
            closeMenu();
          }}
        >
          OK
        </Button>
      </ButtonAndInputRow>
    </ContextMenuMain>
  );
};

export interface ParametersEditorProps {
  queryModifiers: QueryModifiers;
  querySummary: QuerySummary | undefined;
}

export const ParametersEditor = ({
  queryModifiers,
  querySummary,
}: ParametersEditorProps) => {
  if (!querySummary || querySummary.parameters.length === 0) {
    return null;
  }
  return (
    <Row>
      {querySummary.parameters.map(parameter => (
        <ClickToPopover
          key={parameter.name}
          popoverContent={({closeMenu}) => (
            <ParameterEditor
              parameter={parameter}
              queryModifiers={queryModifiers}
              closeMenu={closeMenu}
            />
          )}
          content={() => <ParameterViewer parameter={parameter} />}
        />
      ))}
    </Row>
  );
};

const Row = styled.div`
  font-family: var(--malloy-composer-fontFamily, sans-serif);
  font-size: var(--malloy-composer-fontSize, 14px);
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 4px;
  z-index: 1000;
`;

const Hover = styled.div`
  visibility: hidden;
`;

const ParameterBox = styled.div`
  display: flex;
  align-items: center;

  &:hover ${Hover} {
    visibility: visible !important;
  }
`;

const Label = styled.label`
  white-space: nowrap;
  margin-right: 6px;
`;

const Value = styled.span`
  white-space: nowrap;
  font-weight: lighter;
`;

const StyledInput = styled.input`
  border-radius: 5px;
  border: 1px solid #efefef;
  padding: 5.75px 10px;
  outline: none;
  width: calc(100% - 22px);

  &:focus {
    border-color: var(--malloy-composer-form-focus, #4285f4);
    background-color: var(--malloy-composer-form-focusBackground, #f0f6ff);
  }
`;
