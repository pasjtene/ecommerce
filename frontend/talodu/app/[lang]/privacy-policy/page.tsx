// app/[lang]/privacy-policy/page.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Dictionary {
  privacy_policy: {
    title: string;
    sections: {
      [key: string]: {
        title: string;
        link_text:string;
        cookie_policy:string;
        content: string[];
      };
    };
  };
}

export default function PrivacyPolicy() {
  const params = useParams();
  const [t, setTranslation] = useState<Dictionary | null>(null);

  // Load dictionary
  useEffect(() => {
    const loadDictionary = async () => {
      const dict = await import(`../translations/${params.lang}.json`);
      setTranslation(dict.default);
    };
    loadDictionary();
  }, [params.lang]);

  if (!t) {
    return <div>Loading...</div>; // or your preferred loading state
  }

  const renderContent = (content: string[], sectionKey: string) => {
    return (
     <>
        {content.map((paragraph, index) => (
          <p key={`${sectionKey}-para-${index}`}>{paragraph}</p>
        ))}
        {sectionKey === 'cookies' && t.privacy_policy.sections.cookies.link_text && (
          <p
            dangerouslySetInnerHTML={{
              __html: t.privacy_policy.sections.cookies.link_text.replace(
                '{cookiePolicyLink}',
                `<a href="/${params.lang}/cookie-policy" style="color: tomato" class="text-decoration-none">${t.privacy_policy.sections.cookies.cookie_policy}</a>`
                )
            }}
          />
        )}
      </>
    );
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <h1 className="mb-4">{t.privacy_policy.title}</h1>
          
          {Object.entries(t.privacy_policy.sections).map(([key, section]) => (
            <section key={key} className="mb-5">
              <h2 className="h4 mb-3">{section.title}</h2>
              {renderContent(section.content, key)}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}