import React, { useState } from 'react'
import Accardion from './Accardion';
import { t } from 'i18next';

function AccardionContext() {
  const [openSection, setOpenSection] = useState(false);

  const handleToggle = (index) => {
    setOpenSection(openSection === index ? null : index);
  };
  return (
    <div className="accardion-section">
      <h1 className='accardion-title'>{t("AboutQuestions")}</h1>

      <Accardion
        name={t("AboutQuestionName1")}
        content={t("AboutQuestion1")}
        isOpen={openSection === 0}
        onToggle={() => handleToggle(0)}
      />

      <Accardion
        name={t("AboutQuestionName2")}
        content={t("AboutQuestion2")}
        isOpen={openSection === 1}
        onToggle={() => handleToggle(1)}
      />

      <Accardion
        name={t("AboutQuestionName3")}
        content={t("AboutQuestion3")}
        isOpen={openSection === 2}
        onToggle={() => handleToggle(2)}
      />

    </div>
  )
}

export default AccardionContext