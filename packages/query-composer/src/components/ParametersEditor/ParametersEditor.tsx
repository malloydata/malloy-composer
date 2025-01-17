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
// import {DatePicker} from '../DatePicker';

interface ParameterEditorProps {
  parameter: QuerySummaryParameter;
  queryModifiers: QueryModifiers;
}

const ParameterEditor = ({
  parameter: {name, type, value, defaultValue},
  queryModifiers,
}: ParameterEditorProps) => {
  const [current, setCurrent] = useState<string>(
    stringFromExpr(value ?? defaultValue ?? null)
  );

  const update = () => queryModifiers.editParameter(name, current);
  const updateDate = (date: string) => queryModifiers.editParameter(name, date);
  const updateBoolean = (checked: string) =>
    queryModifiers.editParameter(name, checked);

  if (type === 'date') {
    return (
      <ParameterBox>
        <Label>{titleize(name)}: </Label>
        <DateInput
          value={toDate(current)}
          setValue={time => {
            setCurrent(timeToString(time, 'day'));
            updateDate(timeToString(time, 'day'));
          }}
          granularity="day"
        />
      </ParameterBox>
    );
  } else if (type === 'time') {
    return (
      <ParameterBox>
        <Label>{titleize(name)}: </Label>
        <DateInput
          value={toDate(current)}
          setValue={time => {
            setCurrent(timeToString(time, 'second'));
            updateDate(timeToString(time, 'second'));
          }}
          granularity="second"
        />
      </ParameterBox>
    );
  } else if (type === 'number') {
    return (
      <ParameterBox>
        <Label>{titleize(name)}: </Label>
        <StyledInput
          type="number"
          value={current}
          placeholder={stringFromExpr(defaultValue ?? null, '')}
          onChange={e => setCurrent(e.target.value)}
          onBlur={() => update()}
          onKeyDown={e => {
            if (e.key === 'Enter') update();
          }}
        />
      </ParameterBox>
    );
  } else if (type === 'boolean') {
    return (
      <ParameterBox>
        <Label>{titleize(name)}: </Label>
        <StyledInput
          type="checkbox"
          checked={current === 'true'}
          onChange={e => {
            const value = e.target.checked ? 'true' : 'false';
            setCurrent(value);
            updateBoolean(value);
          }}
        />
      </ParameterBox>
    );
  } else {
    return (
      <ParameterBox>
        <Label>{titleize(name)}: </Label>
        <StyledInput
          value={current}
          placeholder={stringFromExpr(defaultValue ?? null, '')}
          onChange={e => setCurrent(e.target.value)}
          onBlur={() => update()}
          onKeyDown={e => {
            if (e.key === 'Enter') update();
          }}
        />
      </ParameterBox>
    );
  }
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
        <ParameterEditor
          key={parameter.name}
          parameter={parameter}
          queryModifiers={queryModifiers}
        />
      ))}
    </Row>
  );
};

const Row = styled.div`
  display: flex;
  flex-direction: row;
  gap: 12px;
`;

const ParameterBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: bold;
  white-space: nowrap;
`;

const StyledInput = styled.input`
  font-family: var(--malloy-composer-fontFamily, sans-serif);
  font-size: var(--malloy-composer-fontSize, 14px);
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
