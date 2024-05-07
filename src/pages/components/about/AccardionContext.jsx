import React, { useState } from 'react'
import Accardion from './Accardion';

function AccardionContext() {
  const [openSection, setOpenSection] = useState(false);

  const handleToggle = (index) => {
    setOpenSection(openSection === index ? null : index);
  };
  return (
    <div className="accardion-section">
      <h1 className='accardion-title'>Ko'p beriladigan savollar</h1>

      <Accardion
        name={"Web saytingiz xafsizmi?"}
        content={"Xa albatta bizning web saytimiz xafsiz. Bemalol foydalanishingiz mumkin. Siz bizning web saytda shaxsiy akkaunt ochsangiz ham akkauntdagi shaxsiy ma'lumotlaringiz sir saqlanadi. Shuning uchun bemalol kino yoki seriallarni tomosha qilishingiz mumkin. Maroqli hordiq tilaymiz."}
        isOpen={openSection === 0}
        onToggle={() => handleToggle(0)}
      />

      <Accardion
        name={"Yangi kinolarni qayerdan topaman?"}
        content={"Yangi kinolarni topish uchun Bosh sahifaga o'ting. Bosh sahifaning ozgina pastrog'iga tushsangiz o'sha yerdan topishingiz mumkin. Agar o'zingiz kinoni qidirmoqchi bo'sangiz tepada qidiruv belgisi bor. Shu tugmani bosib qidirmoqchi bo'lgan kino, serial yoki multfilmingiz nomi yozishingiz mumkin."}
        isOpen={openSection === 1}
        onToggle={() => handleToggle(1)}
      />

      <Accardion
        name={"Kinolaringiz sifatlimi?"}
        content={"Albatta bizning web saytda hohlagan formatda kinolarni tomosha qilishingiz mumkin."}
        isOpen={openSection === 2}
        onToggle={() => handleToggle(2)}
      />

    </div>
  )
}

export default AccardionContext