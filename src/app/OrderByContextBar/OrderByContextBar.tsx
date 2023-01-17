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
import { useState } from "react";
import styled from "styled-components";
import { OrderByField } from "../../types";
import {
  ContextMenuContent,
  ContextMenuMain,
  ContextMenuOuter,
  ContextMenuTitle,
  EmptyMessage,
} from "../CommonElements";
import { EditOrderBy } from "../EditOrderBy";
import { FieldButton } from "../FieldButton";
import { TypeIcon } from "../TypeIcon";

interface OrderByContextBarProps {
  addOrderBy: (byFieldIndex: number, direction?: "desc" | "asc") => void;
  orderByFields: OrderByField[];
  onComplete: () => void;
}

export const OrderByContextBar: React.FC<OrderByContextBarProps> = ({
  addOrderBy,
  orderByFields,
  onComplete,
}) => {
  const [byField, setByField] = useState<OrderByField | undefined>();

  if (orderByFields.length === 0) {
    return (
      <ContextMenuMain>
        <ContextMenuTitle>Order By</ContextMenuTitle>
        <EmptyMessage>You must add some fields first.</EmptyMessage>
      </ContextMenuMain>
    );
  }

  return (
    <div>
      {byField === undefined && (
        <ContextMenuOuter>
          <ContextMenuContent>
            <ListDiv>
              {orderByFields.map((field) => (
                <FieldButton
                  icon={<TypeIcon type={field.type} kind="dimension" />}
                  key={field.name}
                  onClick={() => setByField(field)}
                  name={field.name}
                  color="dimension"
                />
              ))}
            </ListDiv>
          </ContextMenuContent>
        </ContextMenuOuter>
      )}
      {byField !== undefined && (
        <EditOrderBy
          addOrderBy={addOrderBy}
          onComplete={onComplete}
          byField={byField}
        />
      )}
    </div>
  );
};

const ListDiv = styled.div`
  overflow: hidden;
  display: flex;
  gap: 2px;
  flex-direction: column;
`;
