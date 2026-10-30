import React from 'react'
import { Link } from 'react-router-dom'

import { appConfig } from '../../app/config/config'
import { joinRoute } from '../../app/router/paths'
import { sections } from '../../app/router/sections'
import { sectionIcons } from '../../app/shell/assets'
import { plans, formatPrice } from '../../app/plans/catalog'
import { useCss } from '../../shared/styles/useCss'
import { createOverviewStyles } from './styles'

export const OverviewPage = () => {
  const styles = createOverviewStyles(useCss())
  return (
    <section className={styles.overview} aria-labelledby="overview-title">
      <div className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>
            <span aria-hidden="true">✦</span> Твоя карьера. Твой темп.
          </span>
          <h1 id="overview-title" className={styles.title}>
            Уверенность
            <br />
            приходит <span>с практикой.</span>
          </h1>
          <p className={styles.subtitle}>
            Маленькие шаги сегодня — большие возможности завтра.
            <br />
            Подготовься к собеседованию, на котором будешь собой.
          </p>
          <div className={styles.heroActions}>
            <Link
              className={styles.primaryAction}
              to={joinRoute(
                appConfig.basePath,
                appConfig.features.aiInterview ? 'interview' : 'plan',
              )}
            >
              {appConfig.features.aiInterview
                ? 'Попробовать AI-интервью'
                : 'Составить план'}
              <span aria-hidden="true">↗</span>
            </Link>
            {appConfig.features.aiInterview && (
              <Link
                className={styles.secondaryAction}
                to={joinRoute(appConfig.basePath, 'plan')}
              >
                Сначала составлю план <span aria-hidden="true">→</span>
              </Link>
            )}
          </div>
        </div>
        <div className={styles.illustration} aria-hidden="true">
          <div className={styles.orbit} />
          <span className={styles.sparkle}>✦</span>
          <span className={styles.smallSparkle}>✦</span>
          <div className={styles.practiceCard}>
            <div className={styles.practiceHeader}>
              <span className={styles.practiceIcon}>✦</span>
              <span>ПРАКТИКА С AI</span>
              <span className={styles.practiceDots}>•••</span>
            </div>
            <p className={styles.practiceQuestion}>
              Расскажи о проекте,
              <br />
              которым ты гордишься.
            </p>
            <div className={styles.waveform}>
              {Array.from({ length: 25 }, (_, index) => (
                <span key={index} />
              ))}
            </div>
            <div className={styles.practiceFooter}>
              Здесь можно пробовать и ошибаться
            </div>
          </div>
          <div className={styles.floatingNote}>
            <span>✓</span> С каждым ответом увереннее
          </div>
        </div>
      </div>
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.sectionEyebrow}>ОТ ПЛАНА К РЕЗУЛЬТАТУ</p>
          <h2>Выбери свой следующий шаг</h2>
        </div>
        <span className={styles.sectionNote}>
          Всё для подготовки — в одном месте
        </span>
      </div>
      <div className={styles.cards}>
        {sections.map(({ path, title, description }, index) =>
          path === 'pro' ? null : (
            <Link
              key={path}
              to={joinRoute(appConfig.basePath, path)}
              className={styles.card}
              data-section={path}
            >
              <div className={styles.cardTop}>
                <span className={styles.cardIcon}>
                  <span
                    className={styles.icon(sectionIcons[path])}
                    aria-hidden="true"
                  />
                </span>
                <span className={styles.cardNumber} aria-hidden="true">
                  0{index + 1}
                </span>
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
              <span className={styles.cardAction}>
                Открыть раздел <span aria-hidden="true">↗</span>
              </span>
            </Link>
          ),
        )}
      </div>
      <Link
        to={joinRoute(appConfig.basePath, 'pro')}
        className={styles.proBanner}
      >
        <span className={styles.proSymbol} aria-hidden="true">
          ✦
        </span>
        <div>
          <h2>
            Твоя подготовка может больше <span>PRO</span>
          </h2>
          <p>Три тарифа — от первого шага до больших амбиций.</p>
          <div className={styles.proPrices}>
            {plans.map((plan) => (
              <span key={plan.id}>
                {plan.name}{' '}
                <b>
                  {formatPrice(plan.price)}
                  {plan.price > 0 ? '/мес.' : ''}
                </b>
              </span>
            ))}
          </div>
        </div>
        <span className={styles.proAction}>
          Выбрать тариф <span aria-hidden="true">→</span>
        </span>
      </Link>
    </section>
  )
}
