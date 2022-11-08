/*
 * Copyright 2021 Google LLC
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * version 2 as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 */

import { useRef, useState } from "react";
import styled from "styled-components";
import { Dataset } from "../../types";
import { ActionIcon } from "../ActionIcon";
import { FieldButton } from "../FieldButton";
import { ListNest } from "../ListNest";
import { Popover } from "../Popover";
import { InputBox } from "../SelectDropdown/SelectDropdown";
import { ReactComponent as ChevronDown } from "../assets/img/chevrons/chevron_down.svg";
import { EmptyMessage } from "../CommonElements";
import { StructDef } from "@malloydata/malloy";

interface DirectoryPickerProps {
  datasets: Dataset[] | undefined;
  sourceName: string | undefined;
  setSourceName: (dataset: Dataset, sourceName: string) => void;
  dataset: Dataset | undefined;
}

export const DatasetPicker: React.FC<DirectoryPickerProps> = ({
  datasets,
  sourceName,
  setSourceName,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const label = datasets
    ? sourceName
      ? sourceName
      : "Select source..."
    : "Loading...";

  return (
    <>
      <InputBoxNoOutline tabIndex={0} onClick={() => setOpen(true)} ref={ref}>
        {label}
        <ChevronDown width="22px" height="22px" />
      </InputBoxNoOutline>
      <Popover
        open={open}
        setOpen={setOpen}
        referenceDiv={ref}
        placement="bottom-start"
      >
        <Wapper>
          {datasets &&
            datasets.map((dataset) => {
              const sources = Object.entries(dataset.model.contents)
                .map(([name, value]) => ({
                  name,
                  source: value,
                }))
                .filter((thing) => thing.source.type === "struct") as {
                name: string;
                source: StructDef;
              }[];
              return (
                <div key={dataset.id}>
                  <FieldButton
                    icon={<ActionIcon action="open-directory" color="other" />}
                    name={dataset.name}
                    color="other"
                  />
                  <ListNest>
                    {sources.map((entry) => {
                      return (
                        <FieldButton
                          key={entry.name}
                          icon={
                            <ActionIcon action="analysis" color="dimension" />
                          }
                          onClick={() => {
                            setSourceName(dataset, entry.name);
                            setOpen(false);
                          }}
                          name={entry.name}
                          color="dimension"
                        />
                      );
                    })}
                  </ListNest>
                </div>
              );
            })}
          {!datasets && <EmptyMessage>Loading...</EmptyMessage>}
        </Wapper>
      </Popover>
    </>
  );
};

const InputBoxNoOutline = styled(InputBox)`
  border: none;
  &:hover {
    border: none;
  }
  :focus {
    border: none;
  }
`;

const Wapper = styled.div`
  max-height: 400px;
  overflow-y: auto;
  padding: 10px;
`;
