import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enUSUi from '@refly/i18n/en-US/ui';
import enUSSkill from '@refly/i18n/en-US/skill';
import enUSSkillLog from '@refly/i18n/en-US/skill-log';
import zhHansUi from '@refly/i18n/zh-Hans/ui';
import zhHansSkill from '@refly/i18n/zh-Hans/skill';
import zhHansSkillLog from '@refly/i18n/zh-Hans/skill-log';

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: process.env.NODE_ENV === 'development',
    defaultNS: 'ui',
    resources: {
      en: {
        ui: enUSUi,
        skill: enUSSkill,
        skillLog: enUSSkillLog,
      },
      'zh-CN': {
        ui: zhHansUi,
        skill: zhHansSkill,
        skillLog: zhHansSkillLog,
      },
      zh: {
        ui: zhHansUi,
        skill: zhHansSkill,
        skillLog: zhHansSkillLog,
      },
    },
    // if you see an error like: "Argument of type 'DefaultTFuncReturn' is not assignable to parameter of type xyz"
    // set returnNull to false (and also in the i18next.d.ts options)
    // returnNull: false,
  });
