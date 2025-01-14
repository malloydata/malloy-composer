import {
  ExpressionType,
  FieldDef,
  FilterCondition,
  isJoined,
  PipeSegment,
  QueryFieldDef,
  Segment,
  SourceDef,
  StructDef,
} from '@malloydata/malloy';

// TODO this is a hack to turn `string[]` paths (the new way dotted)
// paths are stored in the struct def back to the old way (just a
// dotted string), so that I can do less work right now.
export function dottify(path: string[]) {
  return path.join('.');
}

export function undottify(path: string) {
  return path.split('.');
}

export function getFields(stage: PipeSegment): QueryFieldDef[] {
  if (stage.type === 'project' || stage.type === 'reduce') {
    return stage.queryFields;
  } else if (stage.type === 'index') {
    return stage.indexFields;
  } else {
    throw new Error(`Unexpected stage type ${stage.type}`);
  }
}

export function setFields(stage: PipeSegment, fields: QueryFieldDef[]) {
  if (stage.type === 'project' || stage.type === 'reduce') {
    stage.queryFields = fields;
  } else if (stage.type === 'index') {
    // Unexported internal type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stage.indexFields = fields as any;
  } else {
    throw new Error(`Unexpected stage type ${stage.type}`);
  }
}

export type FilteredField = QueryFieldDef & {
  e: {
    node: 'filteredExpr';
    kids: {
      filterList: FilterCondition[];
      e: {
        node: 'field';
        path: string[];
      };
    };
  };
};

export function isFilteredField(field: QueryFieldDef): field is FilteredField {
  if (field.type === 'fieldref' || field.type === 'turtle') {
    return false;
  }
  return field.e?.node === 'filteredExpr' && field.e.kids.e.node === 'field';
}

export type RenamedField = QueryFieldDef & {
  e: {
    node: 'field';
    path: string[];
  };
  expressionType?: ExpressionType;
};

export function isRenamedField(field: QueryFieldDef): field is RenamedField {
  if (field.type === 'fieldref' || field.type === 'turtle') {
    return false;
  }
  return field.e?.node === 'field';
}

export class SourceUtils {
  constructor(protected _source: SourceDef | undefined) {}

  updateSource(source: SourceDef) {
    this._source = source;
  }

  getSource() {
    return this._source;
  }

  protected fieldDefForQueryFieldDef(
    field: QueryFieldDef,
    source: SourceDef
  ): FieldDef {
    if (field.type === 'fieldref') {
      return this.getField(source, dottify(field.path));
    } else {
      return field;
    }
  }

  protected getField(source: SourceDef, fieldName: string): FieldDef {
    let parts = fieldName.split('.');
    let currentSource: StructDef = source;
    while (parts.length > 1) {
      const part = parts[0];
      const found: FieldDef | undefined = currentSource.fields.find(
        f => (f.as || f.name) === part
      );
      if (found === undefined) {
        throw new Error(`Could not find (inner) ${part}`);
      }
      if (isJoined(found)) {
        currentSource = found;
        parts = parts.slice(1);
      } else if (found.type === 'turtle') {
        let turtleSource = this.getSource();
        if (turtleSource === undefined) {
          throw new Error('Invalid source');
        }
        for (const stage of found.pipeline) {
          turtleSource = this.modifySourceForStage(stage, turtleSource);
        }
        currentSource = turtleSource;
        parts = parts.slice(1);
      } else {
        throw new Error('Inner segment in path is not a source');
      }
    }
    const found = currentSource.fields.find(f => (f.as || f.name) === parts[0]);
    if (found === undefined) {
      throw new Error(`Could not find ${parts[0]}`);
    }
    return found;
  }

  protected modifySourceForStage(
    stage: PipeSegment,
    source: SourceDef
  ): SourceDef {
    return Segment.nextStructDef(source, stage);
  }
}
