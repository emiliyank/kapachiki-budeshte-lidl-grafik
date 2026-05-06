import Image from 'next/image'

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">За инициативата</h1>
      <p className="mb-8 text-muted-foreground">Капачки за Бъдеще — Враца</p>

      <div className="space-y-6 text-sm leading-7">
        <section className="rounded-lg border bg-white p-5 space-y-3">
          <h2 className="font-semibold text-base">Какво е &quot;Капачки за Бъдеще&quot;?</h2>
          <p className="text-muted-foreground">
            Благотворително събиране на пластмасови капачки с цел закупуване на медицинска
            техника. Организацията съществува от 2017 г. и до момента са дарили 21 кувьоза,
            8 линейки и много друга медицинска техника.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <a
              href="https://www.facebook.com/kapachkizabudeshte"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium text-[#1877F2] hover:bg-blue-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.883v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
              </svg>
              Капачки за Бъдеще
            </a>
            <a
              href="https://www.velikani.bg/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-gray-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <polygon points="10 8 16 12 10 16 10 8" />
              </svg>
              Великани — филмът
            </a>
          </div>
        </section>

        <section className="rounded-lg border bg-white p-5 space-y-3">
          <div className="flex items-center gap-3">
            <Image
              src="/Lidl-Logo.svg.png"
              alt="Лидл"
              width={44}
              height={44}
              className="rounded-lg object-contain flex-shrink-0"
            />
            <h2 className="font-semibold text-base">Контейнерът в Лидл — Враца</h2>
          </div>
          <p className="text-muted-foreground">
            Контейнерът се намира пред магазин Лидл в гр. Враца. Можете да донесете
            пластмасови капачки от бутилки, кутии и опаковки.
          </p>
          <a
            href="https://maps.app.goo.gl/2jeqLRh8ahFVCy3FA"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium underline underline-offset-4 hover:text-foreground transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5"
              aria-hidden="true"
            >
              <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Лидл до автогарата (бул. „Васил Кънчов" 21)
          </a>
          <div className="rounded-md bg-gray-50 p-3 space-y-1">
            <p className="font-medium text-xs uppercase tracking-wide text-muted-foreground">
              Работно време
            </p>
            <div className="flex justify-between">
              <span>Понеделник — Събота</span>
              <span className="font-medium">07:30 — 21:30</span>
            </div>
            <div className="flex justify-between">
              <span>Неделя</span>
              <span className="font-medium">08:00 — 21:00</span>
            </div>
          </div>
        </section>

        <section className="rounded-lg border bg-white p-5 space-y-3">
          <h2 className="font-semibold text-base">Защо да резервирам ден?</h2>
          <p className="text-muted-foreground">
            Резервационната система помага да разпределим потока от дарители
            равномерно и да избегнем препълване на контейнера.
            Резервацията е безплатна и не изисква регистрация.
          </p>
        </section>

        <section className="rounded-lg border bg-white p-5 space-y-3">
          <h2 className="font-semibold text-base">Какви капачки събираме?</h2>
          <p className="text-muted-foreground">
            Събираме само пластмасови капачки без бутилки! Капачките може да са тип
            2-HDPE или 5-РР (от вода, сок, мляко, бира и други напитки, както и шампоан
            и перилни препарати).
          </p>
          <a
            href="https://www.facebook.com/watch/?v=1196455348234154"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium text-[#1877F2] hover:bg-blue-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <polygon points="10 8 16 12 10 16 10 8" />
            </svg>
            Гледайте видео с подробности
          </a>
        </section>

        <section className="rounded-lg border bg-white p-5 space-y-3">
          <h2 className="font-semibold text-base">Какви контейнери се приемат?</h2>
          <ul className="text-muted-foreground space-y-1.5">
            <li>🔵 <strong>Туба 5 л</strong> — малки бутилки и капачки (0.5 единици)</li>
            <li>🟢 <strong>Туба 10 л</strong> — стандартен размер (1 единица)</li>
            <li>🟡 <strong>Чувал</strong> — голямо количество капачки (3 единици)</li>
          </ul>
        </section>
      </div>
    </div>
  )
}
