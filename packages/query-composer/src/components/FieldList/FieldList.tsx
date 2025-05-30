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
import {FieldDef, isJoined, StructDef} from '@malloydata/malloy';
import {useState} from 'react';
import styled from 'styled-components';
import {ActionIcon} from '../ActionIcon';
import {FieldButton} from '../FieldButton';
import {FieldDetailPanel} from '../FieldDetailPanel';
import {HoverToPopover} from '../HoverToPopover';
import {ListNest} from '../ListNest';
import {TypeIcon} from '../TypeIcon';
import {annotationToTaglines, kindOfField, typeOfField} from '../../utils';
import {EventModifiers} from '../component_types';

export interface FieldListProps {
  path?: string[];
  fields: FieldDef[];
  filter: (field: FieldDef) => boolean;
  showNested: boolean;
  selectField: (
    fieldPath: string,
    field: FieldDef,
    modifiers: EventModifiers
  ) => void;
}

// Views and named queries can have the same name so key needs to
// include the source
function keyFor(path: string, field: FieldDef) {
  if ('structRef' in field) {
    return field.structRef + ' -> ' + path;
  } else {
    return path;
  }
}

export const FieldList: React.FC<FieldListProps> = ({
  fields,
  selectField,
  filter,
  showNested,
  path = [],
}) => {
  return (
    <ListDiv>
      {fields
        .filter(field => filter(field) || (showNested && isJoined(field)))
        .map(field => {
          const annotations: string[] = annotationToTaglines(field.annotation);
          const fieldPath = [...path, field.as || field.name].join('.');
          const key = keyFor(fieldPath, field);
          if (filter(field)) {
            const type = typeOfField(field);
            const kind = kindOfField(field);
            return (
              <HoverToPopover
                width={300}
                key={key}
                content={() => (
                  <FieldButton
                    icon={<TypeIcon type={type} kind={kind} />}
                    onClick={event => {
                      const {altKey, ctrlKey, metaKey, shiftKey} = event;
                      selectField(fieldPath, field, {
                        altKey,
                        ctrlKey,
                        metaKey,
                        shiftKey,
                      });
                    }}
                    name={field.as || field.name}
                    color={kind}
                  />
                )}
                popoverContent={() => {
                  return (
                    <FieldDetailPanel
                      fieldPath={fieldPath}
                      annotations={annotations}
                    />
                  );
                }}
              />
            );
          } else if (isJoined(field) && sourceHasAny(field, filter)) {
            return (
              <CollapsibleSource
                key={key}
                source={field}
                filter={filter}
                selectField={selectField}
                path={[...path, field.as || field.name]}
              />
            );
          } else {
            return null;
          }
        })}
    </ListDiv>
  );
};

const ListDiv = styled.div`
  display: flex;
  gap: 2px;
  flex-direction: column;
`;

function sourceHasAny(
  source: StructDef,
  filter: (field: FieldDef) => boolean
): boolean {
  return (
    source.fields.some(filter) ||
    source.fields.some(field => isJoined(field) && sourceHasAny(field, filter))
  );
}

interface CollapsibleSourceProps {
  path: string[];
  source: StructDef;
  filter: (field: FieldDef) => boolean;
  selectField: (
    fieldPath: string,
    field: FieldDef,
    modifiers: EventModifiers
  ) => void;
}

const CollapsibleSource: React.FC<CollapsibleSourceProps> = ({
  source,
  filter,
  selectField,
  path,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <FieldButton
        icon={
          <ActionIcon
            action={open ? 'container-open' : 'container-closed'}
            color="other"
          />
        }
        onClick={() => setOpen(!open)}
        name={source.as || source.name}
        color="other"
      />
      {open && (
        <ListNest>
          <FieldList
            filter={filter}
            selectField={selectField}
            fields={source.fields}
            showNested={true}
            path={path}
          />
        </ListNest>
      )}
    </div>
  );
};
