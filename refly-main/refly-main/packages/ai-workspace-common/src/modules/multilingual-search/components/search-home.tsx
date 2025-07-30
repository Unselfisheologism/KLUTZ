import { useTranslation } from 'react-i18next';
import { SearchBox } from './search-box';

// styles
import './search-home.scss';

export const SearchHome = () => {
  const { t } = useTranslation();

  return (
    <div className="search-home-container">
      <div className="search-home-inner">
        <div className="search-home-header flex justify-between items-center">
          <div className="guide-text">{t('resource.multilingualSearch.title')}</div>
        </div>

        <div className="ai-copilot">
          <SearchBox />
        </div>
      </div>
    </div>
  );
};
