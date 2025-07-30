import { DocumentIntentType } from '@refly/common-types';

export enum MessageIntentSource {
  HomePage = 'homePage', // for qa and generateCanvas
  Project = 'project', // for qa, rewriteCanvas, generateCanvas
  Resource = 'resource', // for qa and generateCanvas
  ResourceQuickAction = 'resourceQuickAction', // for qa and generateCanvas
  Share = 'share', // for qa and generateCanvas
  Document = 'document', // for edit and qa
  Canvas = 'canvas', // for canvas
  Search = 'search', // for qa
  AISelector = 'aiSelector', // for editor
  MultilingualSearch = 'multilingualSearch', // for multilingual search
}

export interface NavigationContext {
  source: MessageIntentSource;
  shouldFetchDetail: boolean;
  intentType?: DocumentIntentType;
  clearSearchParams?: boolean;
}
