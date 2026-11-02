import { Select, type SelectOption } from 'components';
import { supportedLanguages, useTranslation } from 'libs/translations';

const selectOptions: SelectOption<string>[] = supportedLanguages.map(language => ({
  value: language.bcp47Tag,
  label: language.name,
}));

export const LanguageSetting: React.FC = () => {
  const { t, i18n, language } = useTranslation();

  return (
    <div className="venus-language-setting flex flex-wrap items-center justify-between gap-3">
      <p className="venus-settings-label text-light-grey">{t('layout.menu.settings.language.label')}</p>

      <Select
        className="venus-language-select w-40 max-w-full"
        value={language.bcp47Tag}
        onChange={tag => i18n.changeLanguage(tag as string)}
        options={selectOptions}
        dropdownClassName="lg:overflow-auto lg:max-h-48"
        menuClassName="venus-settings-language-menu"
        menuPosition="right"
        matchTriggerWidth
      />
    </div>
  );
};
