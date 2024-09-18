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
import {
  FilterCondition,
  SearchValueMapResult,
  StructDef,
  ModelDef,
} from '@malloydata/malloy';
import {ReactElement, useState} from 'react';
import styled from 'styled-components';
import {compileFilter} from '../../core/compile';
import {stringFilterToString} from '../../core/filters';
import {ActionIcon, ActionIconName} from '../ActionIcon';
import {ColorKey, COLORS} from '../colors';
import {
  ContextMenuContent,
  ContextMenuSearchHeader,
  EmptyMessage,
  ScrollMain,
} from '../CommonElements';
import {useSearch} from '../data';
import {FieldButton} from '../FieldButton';
import {SearchInput} from '../SearchInput';
import {SearchItem, useSearchList} from '../SearchList';
import {LoadingSpinner} from '../Spinner';

interface ActionBase {
  id: string;
  label: string;
  iconName: ActionIconName;
  iconColor: ColorKey;
  isEnabled?: boolean;
  divider?: boolean;
}

interface OneClickAction extends ActionBase {
  kind: 'one_click';
  onClick: () => void;
}

interface SubMenuAction extends ActionBase {
  kind: 'sub_menu';
  closeOnComplete: boolean;
  Component: (props: {onComplete: () => void}) => ReactElement;
}

export type Action = OneClickAction | SubMenuAction;

interface ActionMenuProps {
  valueSearchSource?: StructDef | undefined;
  actions: Action[];
  closeMenu: () => void;
  searchItems?: SearchItem[];
  addFilter?: (filter: FilterCondition) => void;
  topValues?: SearchValueMapResult[] | undefined;
  model?: ModelDef | undefined;
  modelPath?: string;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
  model,
  modelPath,
  actions,
  closeMenu,
  searchItems,
  valueSearchSource,
  topValues,
  addFilter,
}) => {
  const [activeAction, setActiveAction] = useState<SubMenuAction | undefined>(
    actions.length === 1 && actions[0].kind === 'sub_menu'
      ? actions[0]
      : undefined
  );
  const [searchTerm, setSearchTerm] = useState('');
  const {searchResults, isLoading} = useSearch(
    model,
    modelPath,
    valueSearchSource,
    searchTerm
  );
  const stringSearchResults =
    searchResults &&
    searchResults.filter(r => r.fieldType === 'string').slice(0, 100);
  const isSearchEnabled = searchItems !== undefined;

  const {searchList, count: resultCount} = useSearchList({
    searchTerm,
    items: searchItems || [],
    topValues,
  });

  const valueResultCount = stringSearchResults?.length || 0;

  const showFieldResults = resultCount > 0;
  const showValueResults = valueResultCount > 0 || isLoading;

  return (
    <OuterDiv>
      {activeAction === undefined && (
        <>
          {isSearchEnabled && (
            <ContextMenuSearchHeader>
              <SearchInput
                value={searchTerm}
                setValue={setSearchTerm}
                placeholder="Search"
                autoFocus={true}
              />
            </ContextMenuSearchHeader>
          )}
          <Scroll>
            {searchTerm === '' && (
              <ContextMenuContent>
                <ActionButtons>
                  {actions
                    .filter(action => action.isEnabled !== false)
                    .flatMap(action => {
                      const components = [
                        <ActionButton
                          key={action.id}
                          color={action.iconColor}
                          onClick={() => {
                            if (action.kind === 'one_click') {
                              action.onClick();
                              closeMenu();
                            } else {
                              setActiveAction(action);
                            }
                          }}
                        >
                          <ActionIcon
                            action={action.iconName}
                            color={action.iconColor}
                          />
                          <ActionButtonLabel>{action.label}</ActionButtonLabel>
                        </ActionButton>,
                      ];
                      if (action.divider) {
                        components.push(
                          <Divider key={action.id + '/divider'} />
                        );
                      }
                      return components;
                    })}
                </ActionButtons>
              </ContextMenuContent>
            )}
            {searchTerm !== '' && (
              <>
                {showFieldResults && (
                  <ScrollMain
                    style={{
                      borderBottom: showFieldResults ? '1px solid #efefef' : '',
                      maxHeight: showValueResults ? '200px' : '300px',
                    }}
                  >
                    <ContextMenuContent>{searchList}</ContextMenuContent>
                  </ScrollMain>
                )}
                {showValueResults && valueSearchSource && (
                  <ScrollMain
                    style={{
                      borderBottom: '1px solid #efefef',
                      maxHeight: showFieldResults ? '200px' : '300px',
                    }}
                  >
                    <ContextMenuContent>
                      {stringSearchResults &&
                        stringSearchResults.length > 0 &&
                        stringSearchResults.map((searchResult, index) => {
                          return (
                            <FieldButton
                              key={index}
                              name={searchResult.fieldValue}
                              detail={searchResult.fieldName}
                              icon={<ActionIcon action="filter" />}
                              color="filter"
                              onClick={() => {
                                compileFilter(
                                  valueSearchSource,
                                  stringFilterToString(searchResult.fieldName, {
                                    type: 'is_equal_to',
                                    values: [searchResult.fieldValue],
                                  })
                                ).then(expression => {
                                  addFilter && addFilter(expression);
                                  closeMenu();
                                });
                              }}
                            />
                          );
                        })}
                      {stringSearchResults !== undefined &&
                        stringSearchResults.length === 0 && (
                          <EmptyMessage>No value results</EmptyMessage>
                        )}
                      {isLoading && (
                        <EmptyMessage>
                          <LoadingSpinner text="Loading value results..." />
                        </EmptyMessage>
                      )}
                    </ContextMenuContent>
                  </ScrollMain>
                )}
                {!showValueResults && !showFieldResults && (
                  <EmptyMessage>No results</EmptyMessage>
                )}
              </>
            )}
          </Scroll>
        </>
      )}
      {activeAction !== undefined && (
        <>
          <Scroll>
            {activeAction.Component({
              onComplete: () => {
                if (activeAction.closeOnComplete) {
                  closeMenu();
                } else {
                  setActiveAction(undefined);
                }
              },
            })}
          </Scroll>
        </>
      )}
    </OuterDiv>
  );
};

const Divider = styled.div`
  width: calc(100% + 20px);
  margin: 5px -10px;
  border-bottom: 1px solid #efefef;
`;

const OuterDiv = styled.div``;

const ActionButton = styled.button<{
  color: ColorKey;
}>`
  border: none;
  background-color: transparent;
  border-radius: 50px;
  padding: 4px 7px;
  text-align: left;
  font-size: 14px;
  cursor: pointer;
  width: 100%;
  display: flex;
  justify-content: flex-start;
  gap: 10px;
  align-items: center;
  font-family: 'Roboto Mono';
  color: #353535;

  ${({color}) => `
    &:hover {
      background-color: ${COLORS[color].fillLight};
    }
  `}
`;

const ActionButtonLabel = styled.div``;

const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const Scroll = styled.div`
  flex-direction: column;
  display: flex;
`;
