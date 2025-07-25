// app/[lang]/cookie-policy/page.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface Dictionary {
  cookie_policy: {
    title: string;
    introduction: {
      title: string;
      content: string[];
    };
    what_are_cookies: {
      title: string;
      content: string[];
      table: {
        headers: string[];
        rows: {
          category: string;
          purpose: string;
          examples: string;
        }[];
      };
    };
    types_of_cookies: {
      title: string;
      first_party: {
        title: string;
        content: string[];
      };
      third_party: {
        title: string;
        content: string[];
        table: {
          headers: string[];
          rows: {
            service: string;
            purpose: string;
            opt_out_link: string;
          }[];
        };
      };
    };
    your_choices: {
      title: string;
      content: string[];
    };
    data_retention: {
      title: string;
      content: string[];
    };
    policy_updates: {
      title: string;
      content: string[];
    };
    contact: {
      title: string;
      content: string[];
    };
  };
}

export default function CookiePolicy() {
  const params = useParams();
  const [t, setTranslation] = useState<Dictionary | null>(null);

  useEffect(() => {
    const loadDictionary = async () => {
      const dict = await import(`../translations/${params.lang}.json`);
      setTranslation(dict.default);
    };
    loadDictionary();
  }, [params.lang]);

  if (!t) {
    return <div className="container py-5 text-center">Loading...</div>;
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <h1 className="mb-4">{t.cookie_policy.title}</h1>
          
          {/* Introduction */}
          <section className="mb-5">
            <h2 className="h4 mb-3">{t.cookie_policy.introduction.title}</h2>
            {t.cookie_policy.introduction.content.map((paragraph, index) => (
              <p key={`intro-${index}`}>{paragraph}</p>
            ))}
          </section>

          {/* What Are Cookies */}
          <section className="mb-5">
            <h2 className="h4 mb-3">{t.cookie_policy.what_are_cookies.title}</h2>
            {t.cookie_policy.what_are_cookies.content.map((paragraph, index) => (
              <p key={`what-${index}`}>{paragraph}</p>
            ))}
            <div className="table-responsive mt-4">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    {t.cookie_policy.what_are_cookies.table.headers.map((header) => (
                      <th key={header}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {t.cookie_policy.what_are_cookies.table.rows.map((row, index) => (
                    <tr key={`row-${index}`}>
                      <td>{row.category}</td>
                      <td>{row.purpose}</td>
                      <td>{row.examples}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Types of Cookies */}
          <section className="mb-5">
            <h2 className="h4 mb-3">{t.cookie_policy.types_of_cookies.title}</h2>
            
            <h3 className="h5 mt-4">{t.cookie_policy.types_of_cookies.first_party.title}</h3>
            {t.cookie_policy.types_of_cookies.first_party.content.map((paragraph, index) => (
              <p key={`first-party-${index}`}>{paragraph}</p>
            ))}
            
            <h3 className="h5 mt-4">{t.cookie_policy.types_of_cookies.third_party.title}</h3>
            {t.cookie_policy.types_of_cookies.third_party.content.map((paragraph, index) => (
              <p key={`third-party-${index}`}>{paragraph}</p>
            ))}
            <div className="table-responsive mt-4">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    {t.cookie_policy.types_of_cookies.third_party.table.headers.map((header) => (
                      <th key={header}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {t.cookie_policy.types_of_cookies.third_party.table.rows.map((row, index) => (
                    <tr key={`third-party-row-${index}`}>
                      <td>{row.service}</td>
                      <td>{row.purpose}</td>
                      <td>
                        <a href={row.opt_out_link} target="_blank" rel="noopener noreferrer">
                          {row.service} Opt-Out
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Your Choices */}
          <section className="mb-5">
            <h2 className="h4 mb-3">{t.cookie_policy.your_choices.title}</h2>
            {t.cookie_policy.your_choices.content.map((paragraph, index) => (
              <p key={`choices-${index}`}>{paragraph}</p>
            ))}
          </section>

          {/* Data Retention */}
          <section className="mb-5">
            <h2 className="h4 mb-3">{t.cookie_policy.data_retention.title}</h2>
            {t.cookie_policy.data_retention.content.map((paragraph, index) => (
              <p key={`retention-${index}`}>{paragraph}</p>
            ))}
          </section>

          {/* Policy Updates */}
          <section className="mb-5">
            <h2 className="h4 mb-3">{t.cookie_policy.policy_updates.title}</h2>
            {t.cookie_policy.policy_updates.content.map((paragraph, index) => (
              <p key={`updates-${index}`}>{paragraph}</p>
            ))}
          </section>

          {/* Contact */}
          <section className="mb-5">
            <h2 className="h4 mb-3">{t.cookie_policy.contact.title}</h2>
            {t.cookie_policy.contact.content.map((paragraph, index) => (
              <p key={`contact-${index}`}>{paragraph}</p>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}