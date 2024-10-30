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
import {OrderByField, StagePath} from '../../types';
import {ActionMenu, ActionSubmenuComponentProps} from '../ActionMenu';
import {EditOrderBy} from '../EditOrderBy';
import {QueryModifiers} from '../../hooks';

interface OrderByActionMenuProps {
  stagePath: StagePath;
  closeMenu: () => void;
  orderByField: OrderByField;
  existingDirection: 'asc' | 'desc' | undefined;
  orderByIndex: number;
  queryModifiers: QueryModifiers;
}

export const OrderByActionMenu: React.FC<OrderByActionMenuProps> = ({
  stagePath,
  closeMenu,
  orderByField,
  existingDirection,
  queryModifiers,
}) => {
  return (
    <ActionMenu
      closeMenu={closeMenu}
      actions={[
        {
          kind: 'sub_menu',
          id: 'edit',
          iconName: 'order_by',
          iconColor: 'other',
          label: 'Edit Order By',
          closeOnComplete: true,
          Component: ({onComplete}: ActionSubmenuComponentProps) => (
            <EditOrderBy
              addOrderBy={(fieldIndex, direction) =>
                queryModifiers.editOrderBy(stagePath, fieldIndex, direction)
              }
              onComplete={onComplete}
              byField={orderByField}
              initialDirection={existingDirection}
            />
          ),
        },
      ]}
    />
  );
};
