import { useRef, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight, ArrowUpRight, Mail } from "lucide-react";
import { LandingLayout } from "../components/landing/LandingLayout";
import { MosaicImage } from "../components/landing/MosaicImage";
import { Reveal, Rule } from "../components/landing/primitives";

const CONTACT_EMAIL = "mustaverse.studio@gmail.com";
const YOUTUBE_URL = "https://youtu.be/UFAOxXTXFuo";

// 品牌標記沒有圖示庫版本，維持內嵌路徑（與頁尾同一組）。
const X_PATH =
  "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z";
const DISCORD_PATH =
  "M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z";
const YOUTUBE_PATH =
  "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z";

type FieldName = "name" | "org" | "email" | "message";
type Errors = Partial<Record<FieldName, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function ContactPage() {
  const { t, i18n } = useTranslation();
  const gap = i18n.language.startsWith("zh") ? "" : " ";
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<Record<FieldName, string>>({
    name: "",
    org: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  // 表單沒有後端。驗證通過後改成「已備妥」狀態，由使用者自己按下開啟信件軟體，
  // 不代替使用者送出任何東西。
  const [isReady, setIsReady] = useState(false);

  const setField = (field: FieldName) => (value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): Errors => {
    const next: Errors = {};
    if (!values.name.trim()) next.name = t("site.contact.form.required");
    if (!values.email.trim()) next.email = t("site.contact.form.required");
    else if (!EMAIL_PATTERN.test(values.email.trim()))
      next.email = t("site.contact.form.invalidEmail");
    if (!values.message.trim()) next.message = t("site.contact.form.required");
    return next;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    const firstInvalid = (Object.keys(next) as FieldName[])[0];
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`#${firstInvalid}`)?.focus();
      return;
    }
    setIsReady(true);
  };

  const mailtoHref = (() => {
    const subject = `Mustaverse Studio / ${values.name}`;
    const body = [
      `${t("site.contact.form.name")}: ${values.name}`,
      `${t("site.contact.form.org")}: ${values.org}`,
      `${t("site.contact.form.email")}: ${values.email}`,
      "",
      `${t("site.contact.form.message")}:`,
      values.message,
    ].join("\n");
    return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  })();

  const fields: {
    name: FieldName;
    label: string;
    placeholder: string;
    type: string;
    span: string;
    rows?: number;
  }[] = [
    {
      name: "name",
      label: t("site.contact.form.name"),
      placeholder: t("site.contact.form.namePlaceholder"),
      type: "text",
      span: "sm:col-span-1",
    },
    {
      name: "org",
      label: t("site.contact.form.org"),
      placeholder: t("site.contact.form.orgPlaceholder"),
      type: "text",
      span: "sm:col-span-1",
    },
    {
      name: "email",
      label: t("site.contact.form.email"),
      placeholder: t("site.contact.form.emailPlaceholder"),
      type: "email",
      span: "sm:col-span-2",
    },
    {
      name: "message",
      label: t("site.contact.form.message"),
      placeholder: t("site.contact.form.messagePlaceholder"),
      type: "textarea",
      span: "sm:col-span-2",
      rows: 5,
    },
  ];

  const socials = [
    { label: "X", href: "https://x.com/MustaverseLab", path: X_PATH },
    { label: "Discord", href: "https://discord.gg/xjNWXdYzFB", path: DISCORD_PATH },
    { label: "YouTube", href: YOUTUBE_URL, path: YOUTUBE_PATH },
    { label: t("site.contact.emailLabel"), href: `mailto:${CONTACT_EMAIL}`, path: null },
  ];

  return (
    <LandingLayout activePage="contact">
      <section className="mv-texture mv-texture--hatch relative z-10">
        <div className="mv-container pt-16 md:pt-24">
          <Rule />
          <div className="mv-inset grid grid-cols-1 gap-16 pt-14 pb-24 md:pb-32 lg:grid-cols-12 lg:gap-8">
            {/* 左：標題 + 表單 */}
            <div className="lg:col-span-6">
              <Reveal>
                {/* 強調字用同一套字的最亮階，不另外上色，把金色留給下方的送出按鈕。
                    中文不需要詞間空格（"遊戲的未來" 前後補空白會在句號前留一個洞），
                    只有拉丁語系才插入分隔空白。 */}
                <h1 className="mv-h1 text-fg-3">
                  {t("site.contact.titlePre")}
                  {gap}
                  <span className="text-fg-1">{t("site.contact.titleAccent")}</span>
                  {gap}
                  {t("site.contact.titlePost")}
                </h1>
                <p className="mv-lead mt-7">{t("site.contact.body")}</p>
              </Reveal>

              <Reveal delay={120} className="mt-12">
                {isReady ? (
                  <div className="mv-panel mv-marks p-8">
                    <h2 className="mv-h3">{t("site.contact.form.readyTitle")}</h2>
                    <p className="mv-body mv-body--sm mt-3">
                      {t("site.contact.form.readyBody")}
                    </p>
                    <div className="mt-8 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                      <a className="mv-btn mv-btn--accent" href={mailtoHref}>
                        {t("site.contact.form.openMailApp")}
                        <ArrowRight className="mv-btn__arrow h-4 w-4" strokeWidth={2} />
                      </a>
                      <button
                        type="button"
                        onClick={() => setIsReady(false)}
                        className="mv-label cursor-pointer transition-colors hover:text-fg-1"
                      >
                        {t("site.contact.form.editAgain")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <form
                    ref={formRef}
                    noValidate
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 gap-6 sm:grid-cols-2"
                  >
                    {fields.map((field) => {
                      const error = errors[field.name];
                      const describedBy = error ? `${field.name}-error` : undefined;
                      return (
                        <div key={field.name} className={`flex flex-col gap-2 ${field.span}`}>
                          <label className="mv-label" htmlFor={field.name}>
                            {field.label}
                          </label>
                          {field.type === "textarea" ? (
                            <textarea
                              className="mv-field resize-none"
                              id={field.name}
                              rows={field.rows}
                              placeholder={field.placeholder}
                              value={values[field.name]}
                              aria-invalid={Boolean(error)}
                              aria-describedby={describedBy}
                              onChange={(e) => setField(field.name)(e.target.value)}
                            />
                          ) : (
                            <input
                              className="mv-field"
                              id={field.name}
                              type={field.type}
                              placeholder={field.placeholder}
                              value={values[field.name]}
                              aria-invalid={Boolean(error)}
                              aria-describedby={describedBy}
                              onChange={(e) => setField(field.name)(e.target.value)}
                            />
                          )}
                          {error ? (
                            <span className="mv-error" id={`${field.name}-error`} role="alert">
                              {error}
                            </span>
                          ) : null}
                        </div>
                      );
                    })}
                    <div className="sm:col-span-2">
                      <button className="mv-btn mv-btn--accent w-full sm:w-auto" type="submit">
                        {t("site.contact.form.submit")}
                        <ArrowRight className="mv-btn__arrow h-4 w-4" strokeWidth={2} />
                      </button>
                    </div>
                  </form>
                )}
              </Reveal>
            </div>

            {/* 右：社群影像 + 通路 */}
            <div className="lg:col-start-8 lg:col-span-5">
              <Reveal direction="right" delay={80}>
                <MosaicImage
                  src="/images/contact_visual.jpg"
                  alt="Aurayale 的寶石世界場景"
                  className="aspect-[4/3]"
                  scan
                />
                <div className="pt-7">
                  <p className="mv-chip mv-chip--live mb-5">
                    <i aria-hidden="true" />
                    {t("site.contact.openForDeals")}
                  </p>
                  <h2 className="mv-h3">{t("site.contact.communityTitle")}</h2>
                  <p className="mv-body mv-body--sm mt-2">{t("site.contact.communityBody")}</p>
                </div>
              </Reveal>

              <Reveal direction="right" delay={200} className="mt-10">
                <Rule className="mv-rule--plain" />
                <ul>
                  {socials.map((social) => (
                    <li key={social.label} className="mv-row">
                      <a
                        className="group flex items-center justify-between gap-4 py-4"
                        href={social.href}
                        {...(social.path
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                      >
                        <span className="flex items-center gap-4">
                          {social.path ? (
                            <svg
                              className="h-4 w-4 text-fg-3 transition-colors group-hover:text-fg-1"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path d={social.path} />
                            </svg>
                          ) : (
                            <Mail
                              className="h-4 w-4 text-fg-3 transition-colors group-hover:text-fg-1"
                              strokeWidth={1.5}
                            />
                          )}
                          <span className="mv-row__title mv-strong">
                            {social.label}
                          </span>
                        </span>
                        <ArrowUpRight
                          className="h-4 w-4 text-fg-3 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg-1"
                          strokeWidth={1.5}
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
