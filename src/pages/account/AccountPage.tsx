import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../app/auth/useAuth'
import { initials } from '../../app/auth/storage'
import { profileFieldsSchema } from '../../app/auth/schemas'
import type {
  FormSubmitEvent,
  ProfileErrors,
  ProfileFields,
} from '../../app/auth/types'
import { appConfig } from '../../app/config/config'
import { joinRoute } from '../../app/router/paths'
import { useCss } from '../../shared/styles/useCss'
import { createAccountStyles } from './styles'
import { getPlan, formatPrice } from '../../app/plans/catalog'

export const AccountPage = () => {
  const styles = createAccountStyles(useCss())
  const { account, storageError, updateProfile, signOut } = useAuth()
  const plan = getPlan(account.plan)
  const [fields, setFields] = useState(() =>
    profileFieldsSchema.parse(account.profile),
  )
  const [errors, setErrors] = useState<ProfileErrors>({})
  const [message, setMessage] = useState('')
  useEffect(() => {
    setFields(profileFieldsSchema.parse(account.profile))
  }, [account.profile])
  const change = <K extends keyof ProfileFields>(
    key: K,
    value: ProfileFields[K],
  ) => {
    setFields((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
    setMessage('')
  }
  const dirty =
    JSON.stringify(fields) !==
    JSON.stringify(profileFieldsSchema.parse(account.profile))
  const submit = (event: FormSubmitEvent) => {
    event.preventDefault()
    const result = profileFieldsSchema.safeParse(fields)
    if (!result.success) {
      setErrors(
        Object.fromEntries(
          result.error.issues.map((issue) => [issue.path[0], issue.message]),
        ),
      )
      setMessage('Проверь выделенные поля.')
      return
    }
    setErrors({})
    const saved = updateProfile(result.data)
    setMessage(
      saved
        ? 'Изменения сохранены.'
        : 'Изменения применены только в текущей вкладке.',
    )
  }
  const cancel = () => {
    setFields(profileFieldsSchema.parse(account.profile))
    setErrors({})
    setMessage('')
  }
  return (
    <section className={styles.page} aria-labelledby="account-title">
      <header className={styles.heading}>
        <p>ТВОЁ ЛИЧНОЕ ПРОСТРАНСТВО</p>
        <h1 id="account-title">Мой аккаунт</h1>
        <span>
          Настрой профиль под себя. Большая цель начинается с знакомства.
        </span>
      </header>
      {storageError && (
        <p className={styles.notice} role="status">
          Не удалось сохранить данные в браузере. Изменения доступны, пока
          открыта эта вкладка.
        </p>
      )}
      <div className={styles.layout}>
        <form className={styles.panel} onSubmit={submit} noValidate>
          <div className={styles.panelHeading}>
            <h2>Личные данные</h2>
            <p>Так мы будем обращаться к тебе в SkillSprint.</p>
          </div>
          <div className={styles.identity}>
            <span
              className={styles.largeAvatar}
              data-avatar={fields.avatar}
              aria-hidden="true"
            >
              {initials(fields.displayName)}
            </span>
            <div>
              <p className={styles.identityName}>
                {fields.displayName || 'Твоё имя'}
              </p>
              <fieldset className={styles.avatarChoices}>
                <legend>Цвет аватара</legend>
                {profileFieldsSchema.shape.avatar.options.map((color) => (
                  <label key={color}>
                    <input
                      type="radio"
                      name="avatar"
                      value={color}
                      checked={fields.avatar === color}
                      onChange={() => change('avatar', color)}
                      aria-label={
                        {
                          blue: 'Синий',
                          teal: 'Зелёный',
                          amber: 'Тёплый',
                          slate: 'Серый',
                        }[color]
                      }
                    />
                    <span data-avatar={color} />
                  </label>
                ))}
              </fieldset>
            </div>
          </div>
          <div className={styles.fields}>
            <label className={styles.field}>
              Имя
              <input
                name="displayName"
                autoComplete="name"
                value={fields.displayName}
                onChange={(event) => change('displayName', event.target.value)}
                aria-invalid={Boolean(errors.displayName)}
                aria-describedby={errors.displayName ? 'name-error' : undefined}
              />
              {errors.displayName && (
                <span className={styles.error} id="name-error">
                  {errors.displayName}
                </span>
              )}
            </label>
            <label className={styles.field}>
              Электронная почта
              <input
                name="email"
                autoComplete="email"
                type="email"
                value={fields.email}
                placeholder="you@example.com"
                onChange={(event) => change('email', event.target.value)}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <span className={styles.error} id="email-error">
                  {errors.email}
                </span>
              )}
            </label>
          </div>
          <div className={styles.divider} />
          <div className={styles.panelHeading}>
            <h2>Твой карьерный маршрут</h2>
            <p>Сохрани направление и цель, к которой хочешь прийти.</p>
          </div>
          <div className={styles.fields}>
            <label className={styles.field}>
              Направление
              <input
                name="role"
                placeholder="Например, Frontend-разработчик"
                value={fields.role}
                onChange={(event) => change('role', event.target.value)}
                aria-invalid={Boolean(errors.role)}
                aria-describedby={errors.role ? 'role-error' : undefined}
              />
              {errors.role && (
                <span className={styles.error} id="role-error">
                  {errors.role}
                </span>
              )}
            </label>
            <label className={styles.field}>
              Уровень
              <select
                name="level"
                value={fields.level}
                onChange={(event) =>
                  change(
                    'level',
                    profileFieldsSchema.shape.level.parse(event.target.value),
                  )
                }
              >
                <option value="beginner">Только начинаю</option>
                <option value="junior">Junior</option>
                <option value="middle">Middle</option>
                <option value="senior">Senior</option>
              </select>
            </label>
          </div>
          <label className={styles.field}>
            Моя цель
            <textarea
              name="goal"
              rows={3}
              placeholder="Например, уверенно пройти собеседование на Frontend Middle"
              value={fields.goal}
              onChange={(event) => change('goal', event.target.value)}
              aria-invalid={Boolean(errors.goal)}
              aria-describedby="goal-hint goal-error"
            />
            <span className={styles.fieldHint} id="goal-hint">
              До 300 символов · {fields.goal.length}/300
            </span>
            <span className={styles.error} id="goal-error">
              {errors.goal}
            </span>
          </label>
          <div className={styles.actions}>
            <button type="submit" className={styles.primary} disabled={!dirty}>
              Сохранить изменения
            </button>
            <button
              type="button"
              className={styles.secondary}
              disabled={!dirty}
              onClick={cancel}
            >
              Отменить
            </button>
          </div>
          <p className={styles.feedback} role="status">
            {message}
          </p>
        </form>
        <aside className={styles.aside}>
          <div className={styles.summary}>
            <span
              className={styles.largeAvatar}
              data-avatar={account.profile.avatar}
              aria-hidden="true"
            >
              {initials(account.profile.displayName)}
            </span>
            <h2>{account.profile.displayName}</h2>
            <p>{account.profile.role || 'Твой следующий шаг — впереди'}</p>
            <span className={styles.planBadge}>Тариф: {plan.name}</span>
            <div className={styles.summaryDivider} />
            <p className={styles.memberSince}>
              В SkillSprint с{' '}
              {new Intl.DateTimeFormat('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              }).format(new Date(account.profile.createdAt))}
            </p>
          </div>
          <div className={styles.info}>
            <span className={styles.infoIcon} aria-hidden="true">
              ✦
            </span>
            <h2>Твой тариф — {plan.name}</h2>
            <p className={styles.planPrice}>
              {formatPrice(plan.price)}
              <span>{plan.price === 0 ? ' · бесплатно' : ' / месяц'}</span>
            </p>
            <p>
              Выбери больше возможностей для своей подготовки. Пока тарифы
              работают в деморежиме, без оплаты.
            </p>
            <Link to={joinRoute(appConfig.basePath, 'pro')}>
              Управлять тарифом <span aria-hidden="true">→</span>
            </Link>
          </div>
          <button type="button" className={styles.logout} onClick={signOut}>
            Выйти из аккаунта <span aria-hidden="true">↗</span>
          </button>
        </aside>
      </div>
    </section>
  )
}
