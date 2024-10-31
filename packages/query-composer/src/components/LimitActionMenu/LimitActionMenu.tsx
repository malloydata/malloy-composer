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
import {ActionMenu, ActionSubmenuComponentProps} from '../ActionMenu';
import {AddLimit} from '../AddLimit';
import {StagePath} from '../../types';
import {QueryModifiers} from '../../hooks';

interface LimitActionMenuProps {
  stagePath: StagePath;
  limit: number;
  closeMenu: () => void;
  queryModifiers: QueryModifiers;
}

export const LimitActionMenu: React.FC<LimitActionMenuProps> = ({
  stagePath,
  limit,
  closeMenu,
  queryModifiers,
}) => {
  return (
    <ActionMenu
      closeMenu={closeMenu}
      actions={[
        {
          id: 'edit',
          label: 'Change limit',
          iconName: 'limit',
          iconColor: 'other',
          kind: 'sub_menu',
          closeOnComplete: true,
          Component: ({onComplete}: ActionSubmenuComponentProps) => (
            <AddLimit
              addLimit={limit => queryModifiers.addLimit(stagePath, limit)}
              onComplete={onComplete}
              existing={limit}
            />
          ),
        },
      ]}
    />
  );
};
