import {createContext} from 'react';
import {EventModifiers} from '../components/component_types';

export interface UndoContextProps {
  canRedo?: () => boolean;
  canUndo?: () => boolean;
  redo?: (modifiers: EventModifiers) => void;
  undo?: (modifiers: EventModifiers) => void;
}

export const UndoContext = createContext<UndoContextProps>({});
