import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../app/auth/useAuth'
import { plans, formatPrice } from '../../app/plans/catalog'
import type { PlanId } from '../../app/plans/types'
import { appConfig } from '../../app/config/config'
import { joinRoute } from '../../app/router/paths'
import { useCss } from '../../shared/styles/useCss'
import { createPricingStyles } from './styles'

export const PricingPage = () => {
  const styles = createPricingStyles(useCss())
  const { account, choosePlan } = useAuth()
  const [message, setMessage] = useState('')
  const select = (id: PlanId) => {
    const saved = choosePlan(id)
    const name = plans.find((plan) => plan.id === id)?.name
    setMessage(
      saved
        ? `Тариф «${name}» выбран в деморежиме. Оплаты не будет.`
        : `Тариф «${name}» выбран только для этой вкладки: хранилище браузера недоступно.`,
    )
  }
  return (
    <section className={styles.page} aria-labelledby="pricing-title">
      <header className={styles.heading}>
        <span className={styles.eyebrow}>✦ БОЛЬШЕ ВОЗМОЖНОСТЕЙ ДЛЯ РОСТА</span>
        <h1 id="pricing-title">
          Твой рост. <span>Твой выбор.</span>
        </h1>
        <p>От первого шага до больших амбиций — выбери свой темп подготовки.</p>
      </header>
      <div className={styles.demo}>
        <span>Демо</span>Пример цен и возможностей будущих подписок. Оплата не
        подключена.
      </div>
      <div className={styles.cards}>
        {plans.map((plan) => {
          const current = account.plan === plan.id
          return (
            <article
              key={plan.id}
              className={styles.card}
              data-plan={plan.id}
              aria-labelledby={`plan-${plan.id}`}
            >
              <div className={styles.cardTop}>
                <span className={styles.planIcon} aria-hidden="true">
                  {plan.id === 'free' ? '↗' : plan.id === 'pro' ? '✦' : '◆'}
                </span>
                <span className={styles.badge}>
                  {plan.featured
                    ? 'Больше практики'
                    : plan.id === 'ultimate'
                      ? 'Максимум поддержки'
                      : 'Хорошее начало'}
                </span>
              </div>
              <p className={styles.label}>{plan.label}</p>
              <h2 id={`plan-${plan.id}`}>{plan.name}</h2>
              <p className={styles.description}>{plan.description}</p>
              <div className={styles.price}>
                <strong>{formatPrice(plan.price)}</strong>
                <span>
                  {plan.price === 0 ? 'без ограничений по времени' : '/ месяц'}
                </span>
              </div>
              <button
                type="button"
                className={styles.select}
                disabled={current}
                onClick={() => select(plan.id)}
              >
                {current ? 'Твой текущий тариф' : `Выбрать ${plan.name}`}
                <span aria-hidden="true">{current ? '✓' : '→'}</span>
              </button>
              <div className={styles.featuresHeading}>ВОЗМОЖНОСТИ ТАРИФА</div>
              <ul className={styles.features}>
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <span aria-hidden="true">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <p className={styles.cardFooter}>
                {current
                  ? 'Выбран в твоём аккаунте'
                  : plan.id === 'free'
                    ? 'Всё начинается с первого шага'
                    : 'Демонстрационный переход без оплаты'}
              </p>
            </article>
          )
        })}
      </div>
      <div className={styles.feedback} role="status">
        {message ||
          'Выбор тарифа сохранится в этом браузере. Деньги не списываются.'}
      </div>
      <details className={styles.faqDisclosure}>
        <summary>
          Вопросы о тарифах <span aria-hidden="true">+</span>
        </summary>
        <div className={styles.faq}>
          <div>
            <p className={styles.faqEyebrow}>БЕЗ ЛИШНИХ ВОПРОСОВ</p>
            <h2>
              Всё просто
              <br />и прозрачно.
            </h2>
            <Link to={joinRoute(appConfig.basePath, 'account')}>
              Вернуться в аккаунт <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className={styles.questions}>
            <details>
              <summary>Что произойдёт после выбора тарифа?</summary>
              <p>
                Тариф появится в твоём профиле и сохранится после обновления
                страницы. Это демосценарий: возможности платных подписок пока не
                активируются.
              </p>
            </details>
            <details>
              <summary>Нужно ли вводить данные карты?</summary>
              <p>
                Нет. Сейчас оплата не подключена. Цены и состав тарифов показаны
                для демонстрации и могут измениться.
              </p>
            </details>
            <details>
              <summary>Можно вернуться на бесплатный тариф?</summary>
              <p>
                Да, выбери «Бесплатный» на этой странице в любой момент. Профиль
                и его настройки сохранятся.
              </p>
            </details>
          </div>
        </div>
      </details>
    </section>
  )
}
