/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  Annotation,
  annotationToTag,
  DocumentLocation,
} from '@malloydata/malloy';
import {RendererName} from '../types';

export const QUERY_RENDERERS: RendererName[] = [
  'table',
  'bar_chart',
  'dashboard',
  'json',
  'line_chart',
  'list',
  'list_detail',
  'point_map',
  'scatter_chart',
  'segment_map',
  'shape_map',
  'sparkline',
];

export const ATOMIC_RENDERERS: RendererName[] = [
  'number',
  'boolean',
  'currency',
  'image',
  'url',
  'percent',
  'text',
  'time',
];

export const RENDERERS: RendererName[] = [
  ...QUERY_RENDERERS,
  ...ATOMIC_RENDERERS,
];

export function rendererFromAnnotation(
  annotation: Annotation | undefined
): RendererName | undefined {
  const tagProps = annotationToTag(annotation).tag.getProperties();
  const tags = Object.keys(tagProps);

  if (tags.length) {
    if (RENDERERS.includes(tags[0] as RendererName)) {
      return tags[0] as RendererName;
    }
  }
  return undefined;
}

export function updateAnnotation(
  annotation: Annotation | undefined,
  renderer: string | undefined
) {
  const at: DocumentLocation = {
    url: 'internal://internal.malloy',
    range: {
      start: {line: 0, character: 0},
      end: {line: 0, character: 0},
    },
  };

  if (annotation) {
    const {inherits} = annotation;
    const inheritedOnly: Annotation = {inherits};
    const inheritedRenderer = rendererFromAnnotation(inheritedOnly);

    if (inheritedRenderer !== renderer) {
      const removeRenderer = inheritedRenderer ? `-${inheritedRenderer} ` : '';
      const addRenderer = renderer ?? '';
      annotation = {
        blockNotes: [{text: `# ${removeRenderer}${addRenderer}\n`, at}],
      };
    } else {
      annotation = undefined;
    }
  } else {
    if (renderer) {
      annotation = {blockNotes: [{text: `# ${renderer}\n`, at}]};
    }
  }
  return annotation;
}
