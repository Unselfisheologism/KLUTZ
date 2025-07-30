import { useMemo, useEffect } from 'react';
import { Select, Space } from 'antd';
import { useMultilingualSearchStoreShallow } from '@refly/stores';
import { useTranslation } from 'react-i18next';
import { LOCALE } from '@refly/common-types';
import {
  languageNameToLocale,
  localeToLanguageName,
} from '@refly-packages/ai-workspace-common/utils/i18n';

import './search-options.scss';

export const SearchOptions = () => {
  const { i18n, t } = useTranslation();
  const currentUiLocale = i18n.language as LOCALE;

  const multilingualSearchStore = useMultilingualSearchStoreShallow((state) => ({
    searchLocales: state.searchLocales,
    outputLocale: state.outputLocale,
    setSearchLocales: state.setSearchLocales,
    setOutputLocale: state.setOutputLocale,
  }));

  useEffect(() => {
    if (!multilingualSearchStore.outputLocale.code) {
      multilingualSearchStore.setOutputLocale({
        code: currentUiLocale,
        name: getLocaleName(currentUiLocale),
      });
    }
  }, [currentUiLocale]);

  const languageOptions = useMemo(() => {
    const languageMap =
      currentUiLocale === LOCALE.EN ? languageNameToLocale.en : languageNameToLocale['zh-CN'];

    return Object.entries(languageMap).map(([label, code]) => ({
      label,
      value: code,
    }));
  }, [currentUiLocale]);

  const outputLanguageOptions = useMemo(() => {
    return [...languageOptions];
  }, [languageOptions, currentUiLocale]);

  const getLocaleName = (locale: string) => {
    const names =
      currentUiLocale === LOCALE.EN ? localeToLanguageName.en : localeToLanguageName['zh-CN'];
    return names[locale] || locale;
  };

  const handleSearchLocalesChange = (values: string[]) => {
    const limitedValues = values.length > 3 ? [...values.slice(-3)] : values;

    const newLocales = limitedValues.map((code) => ({
      code,
      name: getLocaleName(code),
    }));
    multilingualSearchStore.setSearchLocales(newLocales);
  };

  return (
    <Space className="search-options">
      <div className="select-group">
        <label htmlFor="search-language-select" className="select-label">
          {t('resource.multilingualSearch.searchLabel')}
        </label>
        <Select
          id="search-language-select"
          mode="multiple"
          showSearch
          variant="filled"
          style={{ minWidth: 300 }}
          maxTagCount="responsive"
          placeholder={t('resource.multilingualSearch.selectSearchLanguages')}
          value={multilingualSearchStore.searchLocales.map((l) => l.code)}
          onChange={handleSearchLocalesChange}
          options={languageOptions}
          maxTagTextLength={10}
          maxTagPlaceholder={(omittedValues) => `+${omittedValues.length} more`}
          popupClassName="search-language-dropdown"
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
        />
      </div>
      <div className="select-group">
        <label htmlFor="display-language-select" className="select-label">
          {t('resource.multilingualSearch.displayLabel')}
        </label>
        <Select
          id="display-language-select"
          showSearch
          variant="filled"
          style={{ minWidth: 200 }}
          placeholder={t('resource.multilingualSearch.selectDisplayLanguage')}
          value={multilingualSearchStore.outputLocale.code}
          onChange={(value) => {
            multilingualSearchStore.setOutputLocale({
              code: value,
              name:
                value === 'auto'
                  ? currentUiLocale === LOCALE.EN
                    ? 'Auto'
                    : '自动'
                  : getLocaleName(value),
            });
          }}
          options={outputLanguageOptions}
          popupClassName="display-language-dropdown"
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
        />
      </div>
    </Space>
  );
};
