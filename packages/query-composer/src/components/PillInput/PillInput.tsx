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
import {
  ReactElement,
  ReactNode,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';
import {COLORS} from '../../colors';
import CloseIcon from '../../assets/img/query_clear_hover.svg?react';
import {useClickOutside} from '../../hooks';

interface PillInputProps {
  // TODO it should be required that if value is set, setValue is also set...
  value?: string;
  setValue?: (value: string) => void;
  values: string[];
  setValues: (values: string[]) => void;
  autoFocus?: boolean;
  placeholder?: string;
  type?: string;
  focusElement?: RefObject<HTMLDivElement>;
}

export const PillInput: React.FC<PillInputProps> = ({
  values,
  setValues,
  autoFocus,
  placeholder,
  type = 'text',
  value: controlledValue,
  setValue: setControlledValue,
  focusElement,
}) => {
  const [uncontrolledValue, setUncontrolledValue] = useState('');
  const [focused, setFocused] = useState(false);
  const inp = useRef<HTMLInputElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const [selectedPill, setSelectedPill] = useState<number | undefined>(
    undefined
  );
  const pillRefs = useRef<Array<HTMLDivElement | null>>([]);

  const value = controlledValue || uncontrolledValue;
  const setValue = setControlledValue || setUncontrolledValue;

  console.info({selectedPill, activeElement: document.activeElement});

  const deletePill = useCallback(
    (idx: number) => {
      const newValues = [...values];
      newValues.splice(idx, 1);
      setValues(newValues);
      if (selectedPill === 0) {
        if (values.length === 1) {
          setSelectedPill(undefined);
          inp.current?.focus();
        } else {
          setSelectedPill(0);
        }
      } else {
        setSelectedPill(idx - 1);
      }
    },
    [selectedPill, setValues, values]
  );

  const pills = useMemo(() => {
    pillRefs.current = new Array<HTMLDivElement>(values.length);
    return values.map(
      (value, index): ReactElement<PillProps> => (
        <Pill
          key={value}
          isSelected={selectedPill === index}
          onClick={event => {
            setSelectedPill(index);
            event.stopPropagation();
          }}
          onDelete={() => deletePill(index)}
          forwardRef={ref => {
            pillRefs.current[index] = ref;
          }}
        >
          {value}
        </Pill>
      )
    );
  }, [deletePill, selectedPill, values]);

  useEffect(() => {
    if (selectedPill !== undefined) {
      pillRefs.current[selectedPill]?.focus();
    }
  }, [pills, selectedPill]);

  const onKeyUp = (event: React.KeyboardEvent) => {
    console.info({event});

    if (event.key === 'Backspace') {
      if (selectedPill !== undefined) {
        deletePill(selectedPill);
      }
    } else if (event.key === 'ArrowRight') {
      if (selectedPill === values.length - 1) {
        setSelectedPill(undefined);
        inp.current?.focus();
      } else if (selectedPill !== undefined) {
        setSelectedPill(selectedPill + 1);
      }
    } else if (event.key === 'ArrowLeft') {
      if (selectedPill !== undefined && selectedPill > 0) {
        setSelectedPill(selectedPill - 1);
      }
    } else {
      inp.current?.focus();
    }
  };

  const commitValue = () => {
    if (value.length > 0) {
      setValues([...values, value]);
      setValue('');
    }
  };

  useClickOutside(focusElement ? [ref, focusElement] : ref, () => {
    setFocused(false);
    commitValue();
  });

  return (
    <OuterInput
      onKeyUp={onKeyUp}
      onClick={() => inp.current?.focus()}
      isFocused={focused || selectedPill !== undefined}
      ref={ref}
    >
      {pills}
      <StyledInput
        ref={inp}
        type={type}
        placeholder={values.length === 0 ? placeholder : ''}
        value={value}
        size={1}
        onChange={event => {
          setValue(event.target.value);
        }}
        onKeyDown={event => {
          if (event.key === 'Enter') {
            if (value !== '') {
              commitValue();
              event.stopPropagation();
              event.preventDefault();
            }
          }
        }}
        onKeyUp={event => {
          if (event.key === 'Backspace') {
            if (value === '' && values.length > 0) {
              commitValue();
              inp.current?.blur();
              setSelectedPill(values.length - 1);
            }
          } else if (event.key === 'ArrowLeft') {
            if (
              inp.current?.selectionStart === 0 ||
              inp.current?.selectionStart === null
            ) {
              commitValue();
              inp.current?.blur();
              setSelectedPill(values.length - 1);
              event.preventDefault();
              event.stopPropagation();
            }
          }
        }}
        onFocus={() => {
          setFocused(true);
          setSelectedPill(undefined);
        }}
        autoFocus={autoFocus}
      />
    </OuterInput>
  );
};

interface PillProps {
  onClick: (event: React.MouseEvent) => void;
  onDelete: (event: React.MouseEvent) => void;
  children: ReactNode;
  className?: string;
  forwardRef: (ref: HTMLDivElement | null) => void;
}

const PillInner = ({
  children,
  className,
  forwardRef,
  onClick,
  onDelete,
}: PillProps) => {
  return (
    <div className={className} onClick={onClick} tabIndex={0} ref={forwardRef}>
      {children}
      <div title="Remove">
        <CloseIcon width={16} height={16} onClick={onDelete} title="Remove" />
      </div>
    </div>
  );
};

const OuterInput = styled.div<{
  isFocused: boolean;
}>`
  font-family: var(--malloy-composer-fontFamily, sans-serif);
  font-size: var(--malloy-composer-fontSize, 14px);
  font-weight: normal;
  border-radius: 5px;
  border: 1px solid var(--malloy-composer-form-border, #efefef);
  background-color: var(--malloy-composer-form-background, #efefef);
  padding: 2px 3px;
  outline: none;
  display: flex;
  overflow: hidden;
  gap: 3px;
  flex-wrap: wrap;

  ${({isFocused}) => (isFocused ? `border-color: #4285F4;` : '')}
`;

const Pill = styled(PillInner)<{
  isSelected: boolean;
}>`
  ${({isSelected}) => `
    border: 1px solid ${
      isSelected ? COLORS.dimension.fillStrong : COLORS.dimension.fillMedium
    };
    background-color: ${
      isSelected ? COLORS.dimension.fillMedium : COLORS.dimension.fillLight
    };
  `}

  border-radius: 5px;
  color: ${COLORS.dimension.fillStrong};
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 1px 5px;
  text-transform: none;
  cursor: pointer;
  height: 20px;
`;

const StyledInput = styled.input`
  border: none;
  outline: none;
  font-family: var(--malloy-composer-fontFamily, sans-serif);
  font-size: var(--malloy-composer-fontSize, 14px);
  color: var(--malloy-composer-form-foreground);
  background-color: var(--malloy-composer-form-background);
  min-width: 95px;
  padding: 3.75px 7px;
  flex-grow: 1;
`;
